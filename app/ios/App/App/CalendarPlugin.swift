import Capacitor
import EventKit
import Foundation

/// The phone's calendar, read-only (D-115; the web side is platform/index.ts → calendar).
///
/// `permit` asks once for full access (iOS 17: reading needs full access); `calendars` lists the calendars the phone
/// shows (a Google calendar is here if its account is added in the phone's Settings); `events` reads a range of days,
/// with repeating events already expanded by EventKit, as local wall-clock times. Nothing is ever written to the
/// calendar, and nothing leaves the phone. When the calendar changes, the app is told ("changed") and reads again.
@objc(CalendarPlugin)
public class CalendarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CalendarPlugin"
    public let jsName = "Calendar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "permit", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calendars", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "events", returnType: CAPPluginReturnPromise),
    ]

    private let store = EKEventStore()
    private var watching = false

    private var allowed: Bool {
        EKEventStore.authorizationStatus(for: .event) == .fullAccess
    }

    private func watch() {
        guard !watching else { return }
        watching = true
        NotificationCenter.default.addObserver(forName: .EKEventStoreChanged, object: store, queue: .main) { [weak self] _ in
            self?.notifyListeners("changed", data: [:])
        }
    }

    @objc func permit(_ call: CAPPluginCall) {
        if allowed { watch(); call.resolve(["granted": true]); return }
        store.requestFullAccessToEvents { granted, _ in
            if granted { DispatchQueue.main.async { self.watch() } }
            call.resolve(["granted": granted])
        }
    }

    @objc func calendars(_ call: CAPPluginCall) {
        guard allowed else { call.resolve(["calendars": []]); return }
        let list = store.calendars(for: .event).map { ["id": $0.calendarIdentifier, "title": $0.title] }
        call.resolve(["calendars": list])
    }

    @objc func events(_ call: CAPPluginCall) {
        /* refused or revoked: said as failed, never as an empty calendar (deep review P#6) */
        guard allowed else { call.reject("denied"); return }
        watch()
        let days = max(1, min(31, call.getInt("days") ?? 14))
        let cal = Calendar.current
        let start = cal.startOfDay(for: Date())
        guard let end = cal.date(byAdding: .day, value: days, to: start) else { call.resolve(["events": []]); return }
        let wall = DateFormatter()
        wall.locale = Locale(identifier: "en_US_POSIX")
        wall.timeZone = TimeZone.current
        wall.dateFormat = "yyyy-MM-dd'T'HH:mm"
        let date = DateFormatter()
        date.locale = Locale(identifier: "en_US_POSIX")
        date.timeZone = TimeZone.current
        date.dateFormat = "yyyy-MM-dd"
        /* sorted by start before the cut, so the nearest are kept (EventKit promises no order, P#6) */
        let found = store.events(matching: store.predicateForEvents(withStart: start, end: end, calendars: nil))
            .sorted { ($0.startDate ?? Date.distantPast) < ($1.startDate ?? Date.distantPast) }
        let list: [[String: Any]] = found.prefix(400).map { e in
            let allDay = e.isAllDay
            /* an all-day event's end is the next midnight: its last day is the day before */
            let begins: Date = e.startDate ?? Date()
            let ends: Date = e.endDate ?? begins
            let last: Date = allDay ? (cal.date(byAdding: .second, value: -1, to: ends) ?? ends) : ends
            return [
                /* stable across launches (a Swift hash is not): the event and the day it starts */
                "id": e.calendarItemIdentifier + "@" + wall.string(from: begins),
                "cal": e.calendar.calendarIdentifier,
                "title": String((e.title ?? "").prefix(80)),
                "start": allDay ? date.string(from: begins) : wall.string(from: begins),
                "end": allDay ? date.string(from: last) : wall.string(from: last),
                "allDay": allDay,
            ]
        }
        call.resolve(["events": list])
    }
}
