import Capacitor
import Foundation
import UserNotifications

/// "Again in 10 min" on a reminder (D-107), handled by the app itself (deep review B12): the action has no foreground,
/// so iOS hands it to the app in the background, often with no web page running (the app closed, or asleep). Here the
/// reminder is laid out once more, ten minutes on, with the same words, before anything else runs. Every other
/// notification goes on to Capacitor's router, as before. Installed at launch (AppDelegate), and again once the bridge
/// has made its router (MainViewController), because the bridge makes its router the phone's delegate.
final class AgainNotifications: NSObject, UNUserNotificationCenterDelegate {
    static let shared = AgainNotifications()
    /// The app's AGAIN_IDS (ui/game.svelte.ts): a snooze the app cancels when its job is done or gone.
    private static let ids = (240...245).map { String($0) }
    private static let nextKey = "again.next"
    private weak var router: NotificationRouter?

    func install(router: NotificationRouter? = nil) {
        if let router { self.router = router }
        UNUserNotificationCenter.current().delegate = self
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification,
                                withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        if let router { router.userNotificationCenter(center, willPresent: notification, withCompletionHandler: completionHandler) } else { completionHandler([]) }
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
                                withCompletionHandler completionHandler: @escaping () -> Void) {
        guard response.actionIdentifier == "again",
              let content = response.notification.request.content.mutableCopy() as? UNMutableNotificationContent else {
            if let router { router.userNotificationCenter(center, didReceive: response, withCompletionHandler: completionHandler) } else { completionHandler() }
            return
        }
        let store = UserDefaults.standard, n = store.integer(forKey: Self.nextKey)
        store.set(n + 1, forKey: Self.nextKey)
        let request = UNNotificationRequest(identifier: Self.ids[n % Self.ids.count], content: content,
                                            trigger: UNTimeIntervalNotificationTrigger(timeInterval: 600, repeats: false))
        center.add(request) { _ in completionHandler() }
    }
}
