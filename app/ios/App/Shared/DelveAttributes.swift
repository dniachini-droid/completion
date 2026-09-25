import ActivityKit
import Foundation

/// The delve's panel on the lock screen and in the Dynamic Island (a Live Activity, D-095).
/// Shared by the app, which fills it, and the widget extension, which draws it. The words come from the app's copy.
struct DelveAttributes: ActivityAttributes {
    /// A stretch of time the panel counts: a delve, or a breather (rest).
    struct Span: Codable, Hashable {
        var label: String
        var start: Date
        var end: Date
    }

    struct ContentState: Codable, Hashable {
        /// What is on now. Once its end passes the system redraws the panel as stale, and it shows `next` instead:
        /// the phone can't run the app to move it on, so the panel carries one step ahead (D-095).
        var now: Span
        var rest: Bool
        /// The delve after this one, if the run has one.
        var next: Span?
        /// "From" before the next delve's starting time.
        var from: String
        /// Said once the time is up and nothing follows.
        var done: String
        /// Paused (by Pause, or by going into another app): the ring and the time stand still.
        var paused: Bool
        var left: TimeInterval
        var fraction: Double
        var hint: String
        /// What the panel says if it pauses by itself when Dan goes into another app.
        var pausedLabel: String
    }

    /// The job being delved on.
    var job: String
    /// The run (its first fact's number), so a new run gets a new panel.
    var run: Int
}
