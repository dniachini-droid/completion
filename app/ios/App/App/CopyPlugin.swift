import Capacitor
import Foundation
import UIKit
import UniformTypeIdentifiers

/// Copies of the save (D-107; the web side is platform/index.ts → nativeCopies).
///
/// `share` hands a copy to the phone's share sheet (Save to Files, iCloud Drive, AirDrop…); `pick` opens the Files
/// picker and reads the chosen copy back; `keep` writes the weekly automatic copy into the app's Documents folder, which
/// the Files app shows under "On My iPhone" (UIFileSharingEnabled), keeping the newest few; `list` names what is there.
/// Nothing here reads or changes the save itself: the game decides what a copy holds and what a restore does.
@objc(CopyPlugin)
public class CopyPlugin: CAPPlugin, CAPBridgedPlugin, UIDocumentPickerDelegate {
    public let identifier = "CopyPlugin"
    public let jsName = "Copy"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "share", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pick", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "keep", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "list", returnType: CAPPluginReturnPromise),
    ]

    private var picking: CAPPluginCall?

    private func documents() throws -> URL {
        try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    }
    private func copies(_ dir: URL, _ prefix: String) -> [String] {
        let names = (try? FileManager.default.contentsOfDirectory(atPath: dir.path)) ?? []
        return names.filter { $0.hasPrefix(prefix) && $0.hasSuffix(".json") }.sorted()
    }

    @objc func share(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), let text = call.getString("text") else { call.reject("nothing to share"); return }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent(name)
        do { try text.write(to: url, atomically: true, encoding: .utf8) } catch { call.reject(error.localizedDescription); return }
        DispatchQueue.main.async {
            guard let vc = self.bridge?.viewController else { call.reject("no screen"); return }
            let sheet = UIActivityViewController(activityItems: [url], applicationActivities: nil)
            sheet.popoverPresentationController?.sourceView = vc.view
            sheet.completionWithItemsHandler = { _, done, _, error in
                if let error = error { call.reject(error.localizedDescription) } else { call.resolve(["done": done]) }
            }
            vc.present(sheet, animated: true)
        }
    }

    @objc func pick(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let vc = self.bridge?.viewController else { call.reject("no screen"); return }
            self.picking?.resolve([:])
            self.picking = call
            let picker = UIDocumentPickerViewController(forOpeningContentTypes: [.json, .plainText, .data], asCopy: true)
            picker.delegate = self
            picker.allowsMultipleSelection = false
            vc.present(picker, animated: true)
        }
    }
    public func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        guard let call = picking else { return }
        picking = nil
        guard let url = urls.first else { call.resolve([:]); return }
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        do { call.resolve(["text": try String(contentsOf: url, encoding: .utf8), "name": url.lastPathComponent]) }
        catch { call.reject(error.localizedDescription) }
    }
    public func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        picking?.resolve([:])
        picking = nil
    }

    @objc func keep(_ call: CAPPluginCall) {
        guard let name = call.getString("name"), let text = call.getString("text") else { call.reject("nothing to keep"); return }
        let prefix = call.getString("prefix") ?? "", most = call.getInt("most") ?? 4
        do {
            let dir = try documents()
            try text.write(to: dir.appendingPathComponent(name), atomically: true, encoding: .utf8)
            for old in copies(dir, prefix).dropLast(most) { try? FileManager.default.removeItem(at: dir.appendingPathComponent(old)) }
            call.resolve()
        } catch { call.reject(error.localizedDescription) }
    }

    @objc func list(_ call: CAPPluginCall) {
        do { call.resolve(["names": copies(try documents(), call.getString("prefix") ?? "")]) }
        catch { call.reject(error.localizedDescription) }
    }
}
