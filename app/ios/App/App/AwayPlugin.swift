import Capacitor
import Foundation
import UIKit
import UserNotifications

/// Telling locking the phone from going into another app during a delve (D-094), which only the native side can do.
///
/// iOS sends the app to the background both when the phone is locked and when Dan goes into another app. A lock
/// leaves signs: the system's lock notice at once, and, with a passcode, protected data going away about ten seconds
/// later (and sometimes the screen reading zero brightness). So when the app goes to the background during a delve,
/// it keeps running for up to 15 seconds and watches. Any sign of a lock: nothing happens, the delve goes on. No sign
/// in 15 seconds: it was another app, so the delve's alerts are silenced and the moment Dan left is kept for the game,
/// which pauses the delve from then when he comes back. Back within the 15 seconds with no sign either way: never
/// paused, because a wrong guess must never pause a delve that was only locked (D-094).
@objc(AwayPlugin)
public class AwayPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AwayPlugin"
    public let jsName = "Away"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "watch", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "take", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "log", returnType: CAPPluginReturnPromise),
    ]

    private static let window: TimeInterval = 15
    private static let leftKey = "away.leftAt"
    private static let logKey = "away.log"

    private var watching = false
    private var alerts: [String] = []
    private var resignedAt: Date?
    /// A trip to the background being read: when it began, and the signs of a lock seen so far.
    private var reading: (at: Date, signs: [String])?
    private var task: UIBackgroundTaskIdentifier = .invalid
    /// Each trip to the background has its own number: a judgement left over from an earlier trip never reads this one
    /// (deep review P#3: a quick look at another app, then a lock, read as leaving).
    private var trip = 0

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
                let me = Unmanaged<AwayPlugin>.fromOpaque(observer).takeUnretainedValue()
                DispatchQueue.main.async { me.sign("lock") }
            },
            "com.apple.springboard.lockcomplete" as CFString, nil, .deliverImmediately)
    }

    @objc func watch(_ call: CAPPluginCall) {
        let on = call.getBool("on") ?? false
        let ids = call.getArray("alerts", String.self) ?? []
        DispatchQueue.main.async {
            self.watching = on
            self.alerts = ids
            call.resolve()
        }
    }

    /// When Dan left, kept until the app has written it into the save (`clear`): an app closed in between loses nothing
    /// (deep review P#8).
    @objc func take(_ call: CAPPluginCall) {
        if let at = UserDefaults.standard.object(forKey: Self.leftKey) as? Double { call.resolve(["at": at]) } else { call.resolve([:]) }
    }

    /// Written into the save: forgotten here, if it is still the same time away.
    @objc func clear(_ call: CAPPluginCall) {
        let d = UserDefaults.standard
        if let at = call.getDouble("at"), let kept = d.object(forKey: Self.leftKey) as? Double, kept == at { d.removeObject(forKey: Self.leftKey) }
        call.resolve()
    }

    @objc func log(_ call: CAPPluginCall) {
        call.resolve(["entries": UserDefaults.standard.array(forKey: Self.logKey) ?? []])
    }

    @objc private func resigned() { resignedAt = Date() }

    @objc private func background() {
        guard watching, reading == nil else { return }
        /* from the moment the app stopped being in front (a swipe to another app begins there) */
        reading = (min(resignedAt ?? Date(), Date()), [])
        trip += 1
        let n = trip
        if !UIApplication.shared.isProtectedDataAvailable { sign("protected") }
        dim()
        task = UIApplication.shared.beginBackgroundTask(withName: "away.reading") { [weak self] in self?.decide(n) }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in if self?.trip == n { self?.dim() } }
        DispatchQueue.main.asyncAfter(deadline: .now() + Self.window) { [weak self] in self?.decide(n) }
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
    private func decide(_ n: Int) {
        /* a judgement from an earlier trip: this trip has its own */
        guard n == trip else { return }
        if let r = reading {
            reading = nil
            if r.signs.isEmpty {
                UserDefaults.standard.set(r.at.timeIntervalSince1970 * 1000, forKey: Self.leftKey)
                UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: alerts)
                watching = false
                note(r.at, "left", [])
                /* the lock-screen panel and the Dynamic Island say it has paused too, before the app sleeps */
                Task { @MainActor in
                    await DelvePanelPlugin.hold(at: r.at)
                    self.finish()
                }
                return
            } else {
                note(r.at, "locked", r.signs)
            }
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

    private func note(_ at: Date, _ how: String, _ signs: [String]) {
        let d = UserDefaults.standard
        var l = d.array(forKey: Self.logKey) ?? []
        l.insert(["at": at.timeIntervalSince1970 * 1000, "how": how, "signs": signs], at: 0)
        d.set(Array(l.prefix(12)), forKey: Self.logKey)
    }
}
