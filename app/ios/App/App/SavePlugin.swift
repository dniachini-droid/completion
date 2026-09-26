import Capacitor
import Foundation
import SQLite3

/// The save, in the SQLite built into iOS (D-106; the web side is platform/saves.ts → sqlSaves, which holds all the SQL).
///
/// Three calls: `open` the one database file, `run` a list of statements as one transaction (all or nothing: a fact is
/// either written whole or not at all, even if the app is killed mid-write), and `all` for a query's rows. Everything runs
/// on one queue, one call after another. The file lives in Application Support, which iCloud's phone backup includes and
/// iOS never clears to make room; it stays writable while the phone is locked, so a delve's end can be written then.
@objc(SavePlugin)
public class SavePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SavePlugin"
    public let jsName = "Save"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "run", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "all", returnType: CAPPluginReturnPromise),
    ]

    private let queue = DispatchQueue(label: "save.sqlite")
    private var db: OpaquePointer?
    private static let transient = unsafeBitCast(-1, to: sqlite3_destructor_type.self)

    private struct Failure: Error { let message: String }

    @objc func open(_ call: CAPPluginCall) {
        queue.async {
            do { try self.openOnce(); call.resolve() } catch { call.reject(Self.say(error)) }
        }
    }

    @objc func run(_ call: CAPPluginCall) {
        let steps = call.getArray("steps", JSObject.self) ?? []
        queue.async {
            do {
                try self.openOnce()
                try self.exec("BEGIN IMMEDIATE")
                do {
                    for step in steps {
                        guard let sql = step["sql"] as? String else { throw Failure(message: "a step without sql") }
                        let stmt = try self.prepare(sql, step["args"] as? JSArray ?? [])
                        defer { sqlite3_finalize(stmt) }
                        var rc = sqlite3_step(stmt)
                        while rc == SQLITE_ROW { rc = sqlite3_step(stmt) }
                        guard rc == SQLITE_DONE else { throw self.failure() }
                    }
                    try self.exec("COMMIT")
                } catch {
                    sqlite3_exec(self.db, "ROLLBACK", nil, nil, nil)
                    throw error
                }
                call.resolve()
            } catch { call.reject(Self.say(error)) }
        }
    }

    @objc func all(_ call: CAPPluginCall) {
        let sql = call.getString("sql") ?? ""
        let args = call.getArray("args") ?? []
        queue.async {
            do {
                try self.openOnce()
                let stmt = try self.prepare(sql, args)
                defer { sqlite3_finalize(stmt) }
                var rows: [[Any]] = []
                var rc = sqlite3_step(stmt)
                while rc == SQLITE_ROW {
                    var row: [Any] = []
                    for i in 0..<sqlite3_column_count(stmt) {
                        switch sqlite3_column_type(stmt, i) {
                        case SQLITE_INTEGER: row.append(NSNumber(value: sqlite3_column_int64(stmt, i)))
                        case SQLITE_FLOAT: row.append(NSNumber(value: sqlite3_column_double(stmt, i)))
                        case SQLITE_NULL: row.append(NSNull())
                        default: row.append(sqlite3_column_text(stmt, i).map { String(cString: $0) } ?? "")
                        }
                    }
                    rows.append(row)
                    rc = sqlite3_step(stmt)
                }
                guard rc == SQLITE_DONE else { throw self.failure() }
                call.resolve(["rows": rows])
            } catch { call.reject(Self.say(error)) }
        }
    }

    // MARK: - on the queue only

    private func openOnce() throws {
        if db != nil { return }
        let fm = FileManager.default
        let dir = try fm.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            .appendingPathComponent("Save", isDirectory: true)
        try fm.createDirectory(at: dir, withIntermediateDirectories: true,
                               attributes: [.protectionKey: FileProtectionType.completeUntilFirstUserAuthentication])
        let path = dir.appendingPathComponent("game.sqlite").path
        var handle: OpaquePointer?
        guard sqlite3_open_v2(path, &handle, SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX, nil) == SQLITE_OK else {
            let message = handle.map { String(cString: sqlite3_errmsg($0)) } ?? "cannot open"
            sqlite3_close(handle)
            throw Failure(message: message)
        }
        db = handle
        /* the log is written ahead and each commit reaches the disk before the call returns */
        try exec("PRAGMA journal_mode=WAL")
        try exec("PRAGMA synchronous=FULL")
    }

    private func exec(_ sql: String) throws {
        guard sqlite3_exec(db, sql, nil, nil, nil) == SQLITE_OK else { throw failure() }
    }

    private func prepare(_ sql: String, _ args: JSArray) throws -> OpaquePointer? {
        var stmt: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &stmt, nil) == SQLITE_OK else { throw failure() }
        for (k, arg) in args.enumerated() {
            let i = Int32(k + 1)
            let rc: Int32
            switch arg {
            case let s as String: rc = sqlite3_bind_text(stmt, i, s, -1, Self.transient)
            case let n as NSNumber:
                let d = n.doubleValue
                if d == d.rounded(), abs(d) < 9.0e15 { rc = sqlite3_bind_int64(stmt, i, n.int64Value) }
                else { rc = sqlite3_bind_double(stmt, i, d) }
            default: rc = sqlite3_bind_null(stmt, i)
            }
            guard rc == SQLITE_OK else { sqlite3_finalize(stmt); throw failure() }
        }
        return stmt
    }

    private func failure() -> Failure { Failure(message: db.map { String(cString: sqlite3_errmsg($0)) } ?? "no database") }
    private static func say(_ error: Error) -> String { (error as? Failure)?.message ?? error.localizedDescription }
}
