import AppIntents
import Capacitor
import Foundation

/// Capture from outside the app (D-113): a line said to Siri, typed in the Shortcuts app or sent from the Action button
/// waits here, in the app's own storage, until the game takes it in as a job (ui/game.svelte.ts → drain). The
/// intent runs in the app's own process, so no App Group is needed. Each line keeps its id, so the game never adds it
/// twice, and it is cleared only after the game has written it.
enum SatchelInbox {
    static let lock = NSLock()
    /// Posted when a line arrives while the app runs: the game takes it in at once, never waiting for the next return.
    static let added = Notification.Name("satchel.inbox.added")

    private static func url() throws -> URL {
        let dir = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        return dir.appendingPathComponent("satchel-inbox.json")
    }
    /// Callers hold the lock.
    static func read() -> [[String: String]] {
        guard let u = try? url(), let d = try? Data(contentsOf: u),
              let a = try? JSONSerialization.jsonObject(with: d) as? [[String: String]] else { return [] }
        return a
    }
    private static func write(_ a: [[String: String]]) throws {
        try JSONSerialization.data(withJSONObject: a).write(to: try url(), options: .atomic)
    }
    static func add(_ text: String) throws {
        lock.lock(); defer { lock.unlock() }
        var a = read()
        a.append(["id": UUID().uuidString, "text": text, "at": ISO8601DateFormatter().string(from: Date())])
        try write(a)
    }
    static func remove(_ ids: Set<String>) throws {
        lock.lock(); defer { lock.unlock() }
        try write(read().filter { !ids.contains($0["id"] ?? "") })
    }
}

/// "Add a job": one line becomes a delve job in the satchel, with no day (D-117, D-126), and the app doesn’t open. Calm words.
struct AddToSatchel: AppIntent {
    static var title: LocalizedStringResource = "Add a job"
    static var description = IntentDescription("Adds a job to Long Answer, without opening it.")
    static var openAppWhenRun = false

    @Parameter(title: "Line", requestValueDialog: "What’s the job?")
    var line: String

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let text = line.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return .result(dialog: "Nothing was added.") }
        try SatchelInbox.add(String(text.prefix(120)))
        /* the app open on screen takes it in at once (deep review P#22) */
        await MainActor.run { NotificationCenter.default.post(name: SatchelInbox.added, object: nil) }
        return .result(dialog: "It’s in your satchel.")
    }
}

/// The spoken phrases; the same intent is offered to the Action button and the Shortcuts app.
struct SatchelShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddToSatchel(),
            phrases: ["Add a job in \(.applicationName)", "Add a job to \(.applicationName)"],
            shortTitle: "Add a job",
            systemImageName: "plus.circle"
        )
    }
}

/// The game's side: read what waits, and clear what it has written (the web side is platform/index.ts → inbox).
@objc(InboxPlugin)
public class InboxPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "InboxPlugin"
    public let jsName = "Inbox"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "take", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clear", returnType: CAPPluginReturnPromise),
    ]

    override public func load() {
        NotificationCenter.default.addObserver(self, selector: #selector(arrived), name: SatchelInbox.added, object: nil)
    }
    @objc private func arrived() { notifyListeners("added", data: [:]) }

    @objc func take(_ call: CAPPluginCall) {
        SatchelInbox.lock.lock()
        let lines = SatchelInbox.read()
        SatchelInbox.lock.unlock()
        call.resolve(["lines": lines])
    }

    @objc func clear(_ call: CAPPluginCall) {
        let ids = Set((call.getArray("ids") ?? []).compactMap { $0 as? String })
        do { try SatchelInbox.remove(ids); call.resolve([:]) } catch { call.reject(error.localizedDescription) }
    }
}
