import ActivityKit
import Capacitor
import Foundation
import UIKit
import WebKit

/// The app's window, with its own small plugin registered (Capacitor finds the npm plugins by itself).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(DelvePanelPlugin())
        bridge?.registerPluginInstance(AwayPlugin())   // leaving the app pauses a delve (AwayPlugin.swift)
        bridge?.registerPluginInstance(SavePlugin())   // the save, in SQLite (SavePlugin.swift, D-106)
        bridge?.registerPluginInstance(CopyPlugin())   // copies of the save: share, restore, the weekly copy (D-107)
        bridge?.registerPluginInstance(InboxPlugin())   // lines said to Siri or the Action button (InboxPlugin.swift, D-113)
        bridge?.registerPluginInstance(CalendarPlugin())   // the phone's calendar, read-only (CalendarPlugin.swift, D-115)
        // the bridge made its router the notifications' delegate: "Again in 10 min" stays the app's own (AgainNotifications.swift)
        if let router = bridge?.notificationRouter { AgainNotifications.shared.install(router: router) }
        /* the phone's text size (Dynamic Type), honoured: every size in the app is multiplied by --ts (deep review A#33);
           set before the page draws, and again whenever Dan changes it in Settings */
        let script = WKUserScript(source: Self.textScaleJS(), injectionTime: .atDocumentStart, forMainFrameOnly: true)
        webView?.configuration.userContentController.addUserScript(script)
        NotificationCenter.default.addObserver(self, selector: #selector(textSizeChanged), name: UIContentSizeCategory.didChangeNotification, object: nil)
    }

    /// The text size chosen in iOS Settings, as a scale of the body text's own 17 points: kept between a little smaller
    /// and half again larger, where every screen still fits.
    static func textScale() -> Double {
        let s = Double(UIFontMetrics(forTextStyle: .body).scaledValue(for: 17) / 17)
        return min(1.5, max(0.9, s))
    }
    static func textScaleJS() -> String {
        "document.documentElement.style.setProperty('--ts', '\(String(format: "%.3f", textScale()))');"
    }
    @objc private func textSizeChanged() { webView?.evaluateJavaScript(Self.textScaleJS(), completionHandler: nil) }
}

/// Shows, updates and ends the delve's panel (D-095); the web side is platform/index.ts → DelvePanel.
@objc(DelvePanelPlugin)
public class DelvePanelPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DelvePanelPlugin"
    public let jsName = "DelvePanel"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise)
    ]

    private func date(_ call: CAPPluginCall, _ key: String) -> Date? {
        guard let ms = call.getDouble(key), ms > 0 else { return nil }
        return Date(timeIntervalSince1970: ms / 1000)
    }

    /// The panel's calls run one after another, in the order the app made them: two close together for a new run never
    /// make two panels, and an end never races a show (deep review P#16).
    private static let lock = NSLock()
    private static var chain: Task<Void, Never>?
    private static func inOrder(_ work: @escaping () async -> Void) {
        lock.lock(); defer { lock.unlock() }
        let prev = chain
        chain = Task { await prev?.value; await work() }
    }

    /// What the panel turns to if Dan goes into another app (D-094), as the app last said; the app is asleep by then.
    private struct Away { var label: String; var line: String; var left: String; var len: Double }
    private static var away: Away?

    @objc func show(_ call: CAPPluginCall) {
        let len = call.getDouble("awayLen") ?? 0
        DispatchQueue.main.async {
            Self.away = len > 0 ? Away(label: call.getString("awayLabel") ?? "", line: call.getString("awayLine") ?? "",
                                        left: call.getString("awayLeft") ?? "", len: len) : nil
        }
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { call.resolve(["shown": false]); return }
        let run = call.getInt("run") ?? 0
        let now = Date()
        let state = DelveAttributes.ContentState(
            place: call.getString("place") ?? "",
            job: call.getString("job") ?? "",
            phase: call.getString("phase") ?? "delve",
            label: call.getString("label") ?? "",
            line: call.getString("line") ?? "",
            left: call.getString("left") ?? "",
            start: date(call, "start") ?? now,
            end: date(call, "end") ?? now,
            heldFraction: call.getDouble("heldFraction") ?? 0,
            heldTime: call.getString("heldTime") ?? "",
            notch: call.getDouble("notch"),
            afterLabel: call.getString("afterLabel") ?? "",
            afterLine: call.getString("afterLine") ?? "",
            afterLeft: call.getString("afterLeft") ?? "",
            afterStart: date(call, "afterStart"),
            afterEnd: date(call, "afterEnd")
        )
        let content = ActivityContent(state: state, staleDate: date(call, "staleAt"))
        Self.inOrder {
            let all = Activity<DelveAttributes>.activities
            /* another run's panel, left by a closed app, goes */
            for other in all where other.attributes.run != run {
                await other.end(nil, dismissalPolicy: .immediate)
            }
            if let mine = all.first(where: { $0.attributes.run == run }) {
                /* a panel Dan swiped away stays away */
                if mine.activityState == .active || mine.activityState == .stale { await mine.update(content) }
                call.resolve(["shown": true])
                return
            }
            do {
                _ = try Activity.request(attributes: DelveAttributes(run: run), content: content, pushType: nil)
                call.resolve(["shown": true])
            } catch {
                call.reject("The delve's panel could not be shown: \(error.localizedDescription)")
            }
        }
    }

    /// Dan went into another app at `at` (AwayPlugin, D-094): the panel stops where the delve will be paused, in the
    /// paused look, rather than counting on while the app sleeps. Left in a breather: the next delve waits, not begun.
    /// Coming back puts the panel right from the game's own rules.
    @MainActor static func hold(at: Date) async {
        guard let a = away else { return }
        for activity in Activity<DelveAttributes>.activities where activity.activityState == .active || activity.activityState == .stale {
            var s = activity.content.state
            guard s.phase == "delve" || s.phase == "breather", at < s.end else { continue }
            let span = s.end.timeIntervalSince(s.start)
            let done = s.phase == "delve" && span > 0 ? min(1, max(0, at.timeIntervalSince(s.start) / span)) : 0
            let left = Int((a.len * (1 - done) / 1000).rounded(.up))
            s.phase = "held"
            s.label = a.label
            s.line = a.line
            s.left = a.left
            s.heldFraction = done
            s.heldTime = "\(left / 60):\(String(format: "%02d", left % 60))"
            await activity.update(ActivityContent(state: s, staleDate: nil))
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        Self.inOrder {
            for activity in Activity<DelveAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            call.resolve()
        }
    }
}
