import ActivityKit
import Capacitor
import Foundation

/// The app's window, with its own small plugin registered (Capacitor finds the npm plugins by itself).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(DelvePanelPlugin())
    }
}

/// Shows, updates and ends the delve's panel (D-094); the web side is platform/index.ts → DelvePanel.
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

    @objc func show(_ call: CAPPluginCall) {
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
            afterLabel: call.getString("afterLabel") ?? "",
            afterLine: call.getString("afterLine") ?? "",
            afterLeft: call.getString("afterLeft") ?? "",
            afterStart: date(call, "afterStart"),
            afterEnd: date(call, "afterEnd")
        )
        let content = ActivityContent(state: state, staleDate: date(call, "staleAt"))
        Task {
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

    @objc func end(_ call: CAPPluginCall) {
        Task {
            for activity in Activity<DelveAttributes>.activities {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            call.resolve()
        }
    }
}
