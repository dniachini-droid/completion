import ActivityKit
import Capacitor
import Foundation
import UIKit
import UserNotifications

/// The delve beyond the web page (D-094, D-095): its panel on the lock screen and in the Dynamic Island (a Live
/// Activity), and telling locking the phone from going into another app, which only the native side can do.
///
/// Leaving: iOS sends the app to the background both when the phone is locked and when Dan goes into another app.
/// A lock leaves signs: the system's lock notice at once, and, with a passcode, protected data going away about ten
/// seconds later (and sometimes the screen reading zero brightness). So when the app goes to the background during a
/// delve, it keeps running for up to 15 seconds and watches. Any sign of a lock: nothing happens, the delve goes on.
/// No sign in 15 seconds: it was another app, so the delve's alerts are silenced, the panel shows it paused, and the
/// moment Dan left is kept for the game, which pauses the delve from then when he comes back. Back within the 15
/// seconds with no sign either way: never paused, because a wrong guess must never pause a delve that was only
/// locked (D-094).
@objc(DelvePlugin)
public class DelvePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DelvePlugin"
    public let jsName = "Delve"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "end", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "watch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "take", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "log", returnType: CAPPluginReturnPromise),
    ]

    private static let window: TimeInterval = 15
    private static let leftKey = "delve.leftAt"
    private static let logKey = "delve.leaveLog"

    private var watching = false
    private var alerts: [String] = []
    private var resignedAt: Date?
    /// A trip to the background being read: when it began, and the signs of a lock seen so far.
    private var reading: (at: Date, signs: [String])?
    private var task: UIBackgroundTaskIdentifier = .invalid
    /// What the panel shows now, so it can be paused here without the app's page.
    private var state: DelveAttributes.ContentState?

    override public func load() {
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(resigned), name: UIApplication.willResignActiveNotification, object: nil)
        nc.addObserver(self, selector: #selector(background), name: UIApplication.didEnterBackgroundNotification, object: nil)
        nc.addObserver(self, selector: #selector(foreground), name: UIApplication.willEnterForegroundNotification, object: nil)
        nc.addObserver(self, selector: #selector(protectedGone), name: UIApplication.protectedDataWillBecomeUnavailableNotification, object: nil)
        /* the system's own notice that the phone has locked */
        CFNotificationCenterAddObserver(
            CFNotificationCenterGetDarwinNotifyCenter(), Unmanaged.passUnretained(self).toOpaque(),
            { _, observer, _, _, _ in
                guard let observer else { return }
                let me = Unmanaged<DelvePlugin>.fromOpaque(observer).takeUnretainedValue()
                DispatchQueue.main.async { me.sign("lock") }
            },
            "com.apple.springboard.lockcomplete" as CFString, nil, .deliverImmediately)
    }

    // MARK: the panel

    @objc func show(_ call: CAPPluginCall) {
        guard ActivityAuthorizationInfo().areActivitiesEnabled,
              let job = call.getString("job"), let label = call.getString("label"),
              let start = call.getDouble("start"), let end = call.getDouble("end") else { call.resolve(); return }
        let run = call.getInt("run") ?? 0
        var next: DelveAttributes.Span?
        if let n = call.getObject("next"), let l = n["label"] as? String, let a = n["start"] as? Double, let b = n["end"] as? Double {
            next = .init(label: l, start: Self.date(a), end: Self.date(b))
        }
        let s = DelveAttributes.ContentState(
            now: .init(label: label, start: Self.date(start), end: Self.date(end)),
            rest: call.getBool("rest") ?? false, next: next,
            from: call.getString("from") ?? "", done: call.getString("done") ?? "",
            paused: call.getBool("paused") ?? false, left: (call.getDouble("left") ?? 0) / 1000,
            fraction: call.getDouble("fraction") ?? 0, hint: call.getString("hint") ?? "",
            pausedLabel: call.getString("pausedLabel") ?? label)
        DispatchQueue.main.async { self.state = s }
        Task {
            await self.put(s, job: job, run: run)
            call.resolve()
        }
    }

    @objc func end(_ call: CAPPluginCall) {
        DispatchQueue.main.async { self.state = nil }
        Task {
            for a in Activity<DelveAttributes>.activities { await a.end(nil, dismissalPolicy: .immediate) }
            call.resolve()
        }
    }

    private func put(_ s: DelveAttributes.ContentState, job: String, run: Int) async {
        /* running, the panel goes stale when its span ends, and shows what comes next (DelveActivity.swift) */
        let content = ActivityContent(state: s, staleDate: s.paused ? nil : s.now.end)
        if let a = Activity<DelveAttributes>.activities.first(where: { $0.attributes.run == run && $0.attributes.job == job }) {
            await a.update(content)
            return
        }
        for a in Activity<DelveAttributes>.activities { await a.end(nil, dismissalPolicy: .immediate) }
        _ = try? Activity.request(attributes: DelveAttributes(job: job, run: run), content: content, pushType: nil)
    }

    private static func date(_ ms: Double) -> Date { Date(timeIntervalSince1970: ms / 1000) }

    // MARK: leaving the app

    @objc func watch(_ call: CAPPluginCall) {
        let on = call.getBool("on") ?? false
        let ids = call.getArray("alerts", String.self) ?? []
        DispatchQueue.main.async {
            self.watching = on
            self.alerts = ids
            call.resolve()
        }
    }

    @objc func take(_ call: CAPPluginCall) {
        let d = UserDefaults.standard
        if let at = d.object(forKey: Self.leftKey) as? Double {
            d.removeObject(forKey: Self.leftKey)
            call.resolve(["at": at])
        } else {
            call.resolve([:])
        }
    }

    @objc func log(_ call: CAPPluginCall) {
        call.resolve(["entries": UserDefaults.standard.array(forKey: Self.logKey) ?? []])
    }

    @objc private func resigned() { resignedAt = Date() }

    @objc private func background() {
        guard watching, reading == nil else { return }
        /* from the moment the app stopped being in front (a swipe to another app begins there) */
        let at = min(resignedAt ?? Date(), Date())
        reading = (at, [])
        if !UIApplication.shared.isProtectedDataAvailable { sign("protected") }
        dim()
        task = UIApplication.shared.beginBackgroundTask(withName: "delve.leaving") { [weak self] in self?.decide() }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in self?.dim() }
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.window) { [weak self] in self?.decide() }
    }

    /// The screen reads zero brightness once it is off (not on every phone: an always-on screen may not).
    private func dim() {
        let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        if let b = scene?.screen.brightness, b <= 0 { sign("dark") }
    }

    @objc private func protectedGone() { sign("protected") }

    private func sign(_ what: String) {
        guard var r = reading else { return }
        if !r.signs.contains(what) { r.signs.append(what) }
        reading = r
    }

    /// 15 seconds on (or iOS asking for its time back): a lock, or another app.
    private func decide() {
        guard let r = reading else { finish(); return }
        reading = nil
        if r.signs.isEmpty {
            UserDefaults.standard.set(r.at.timeIntervalSince1970 * 1000, forKey: Self.leftKey)
            UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: alerts)
            watching = false
            note(r.at, "left", [])
            if var s = state { pause(&s, at: r.at) }
        } else {
            note(r.at, "locked", r.signs)
        }
        finish()
    }

    @objc private func foreground() {
        /* back before the reading ended: a lock shows as a lock; with no sign either way, the delve is never paused */
        if let r = reading {
            reading = nil
            note(r.at, r.signs.isEmpty ? "unsure" : "locked", r.signs)
        }
        finish()
    }

    private func finish() {
        if task != .invalid { UIApplication.shared.endBackgroundTask(task); task = .invalid }
    }

    /// The panel shows the delve paused where Dan left (a breather: the delve after it, not yet begun).
    private func pause(_ s: inout DelveAttributes.ContentState, at: Date) {
        if s.rest, let n = s.next {
            s.left = n.end.timeIntervalSince(n.start); s.fraction = 0
        } else {
            let whole = max(1, s.now.end.timeIntervalSince(s.now.start))
            s.left = max(0, s.now.end.timeIntervalSince(at)); s.fraction = min(1, max(0, 1 - s.left / whole))
        }
        s.paused = true
        s.rest = false
        s.now.label = s.pausedLabel
        state = s
        let st = s
        Task {
            for a in Activity<DelveAttributes>.activities { await a.update(ActivityContent(state: st, staleDate: nil)) }
        }
    }

    private func note(_ at: Date, _ how: String, _ signs: [String]) {
        let d = UserDefaults.standard
        var l = d.array(forKey: Self.logKey) ?? []
        l.insert(["at": at.timeIntervalSince1970 * 1000, "how": how, "signs": signs], at: 0)
        d.set(Array(l.prefix(12)), forKey: Self.logKey)
    }
}
