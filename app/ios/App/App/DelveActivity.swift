import ActivityKit
import Foundation

/// The delve's panel on the lock screen and in the Dynamic Island (D-095). Compiled into the app and into the
/// LiveActivity extension alike. Every word comes from the app (copy/en.ts via ui/panel.ts); the panel only lays them
/// out, and the phone itself ticks its countdown and ring, so the app needn't run.
struct DelveAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var place: String
        var job: String
        /// "delve", "breather" or "held"
        var phase: String
        var label: String
        var line: String
        var left: String
        /// The current delve's or breather's span (not used while held).
        var start: Date
        var end: Date
        /// While held: how much of the delve is done, and its time left ("12:40").
        var heldFraction: Double
        var heldTime: String
        /// Where on the ring the 5-minute mark falls (a fraction of the delve); nil or 0 for none. Optional, so a panel
        /// saved by an older build still reads.
        var notch: Double?
        /// What the panel shows once `end` passes with the app closed: the rest of the run, counted down to its end,
        /// or (no span) that the delve is over.
        var afterLabel: String
        var afterLine: String
        var afterLeft: String
        var afterStart: Date?
        var afterEnd: Date?
    }

    /// The run this panel follows (its fact's number in the save).
    var run: Int
}
