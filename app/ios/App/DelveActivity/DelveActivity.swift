import ActivityKit
import SwiftUI
import WidgetKit

/// The delve on the lock screen and in the Dynamic Island (D-095): the purple light, the job, the countdown and a
/// filling ring. Apple allows only still designs here, so the light doesn't move: the ring and the numbers are the
/// motion, and the system ticks them, so the app needn't run.
@main
struct DelveActivityBundle: WidgetBundle {
    var body: some Widget { DelvePanel() }
}

/* direction D's colours (direction.css): the night, the violet light, the ink */
private let night = Color(red: 5 / 255, green: 5 / 255, blue: 12 / 255)
private let violet = Color(red: 143 / 255, green: 134 / 255, blue: 255 / 255)
private let violetHi = Color(red: 217 / 255, green: 214 / 255, blue: 255 / 255)
private let ink = Color(red: 236 / 255, green: 233 / 255, blue: 244 / 255)
private let ink2 = Color(red: 236 / 255, green: 233 / 255, blue: 244 / 255).opacity(0.62)

/// What the panel shows at this moment: the span on now, the next delve once that has passed, or stillness.
private struct Shown {
    enum Mode { case timed(ClosedRange<Date>), still(Double, TimeInterval), over }
    enum Line { case text(String), from(String, Date) }
    let label: String
    let mode: Mode
    let rest: Bool
    let line: Line?

    init(_ s: DelveAttributes.ContentState, stale: Bool) {
        let span = { (a: DelveAttributes.Span) in a.start...max(a.start, a.end) }
        if s.paused {
            label = s.now.label; mode = .still(s.fraction, s.left); rest = false; line = .text(s.hint)
        } else if !stale {
            label = s.now.label; mode = .timed(span(s.now)); rest = s.rest
            line = s.rest ? s.next.map { .from("\($0.label) · \(s.from)", $0.start) } : nil
        } else if let n = s.next {
            label = n.label; mode = .timed(span(n)); rest = false; line = .from(s.from, n.start)
        } else {
            label = s.now.label; mode = .over; rest = false; line = .text(s.done)
        }
    }
}

/// The ring, filling as the delve goes, over a still pool of purple light.
private struct Ring: View {
    let s: Shown
    let size: CGFloat
    var body: some View {
        ZStack {
            Circle()
                .fill(RadialGradient(colors: [violet.opacity(s.rest ? 0.18 : 0.42), .clear], center: .center, startRadius: 0, endRadius: size * 0.72))
                .frame(width: size * 1.5, height: size * 1.5)
            Group {
                switch s.mode {
                case .timed(let r):
                    ProgressView(timerInterval: r, countsDown: false, label: { EmptyView() }, currentValueLabel: { EmptyView() })
                case .still(let f, _):
                    ProgressView(value: min(1, max(0, f)))
                case .over:
                    ProgressView(value: 1)
                }
            }
            .progressViewStyle(.circular)
            .tint(s.rest ? violet.opacity(0.55) : violet)
            .frame(width: size, height: size)
        }
        .frame(width: size, height: size)
    }
}

/// The time left: ticked by the system while running, still while paused.
private struct Clock: View {
    let s: Shown
    var body: some View {
        switch s.mode {
        case .timed(let r):
            Text(timerInterval: r, countsDown: true).monospacedDigit()
        case .still(_, let left):
            let n = Int(left.rounded(.up))
            Text(String(format: "%d:%02d", n / 60, n % 60)).monospacedDigit()
        case .over:
            Text("0:00").monospacedDigit()
        }
    }
}

private struct LineText: View {
    let line: Shown.Line
    var body: some View {
        switch line {
        case .text(let t): Text(t)
        case .from(let t, let d): Text("\(t) ") + Text(d, style: .time)
        }
    }
}

struct DelvePanel: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DelveAttributes.self) { ctx in
            let s = Shown(ctx.state, stale: ctx.isStale)
            HStack(spacing: 16) {
                Ring(s: s, size: 52)
                VStack(alignment: .leading, spacing: 3) {
                    Text(ctx.attributes.job)
                        .font(.system(.headline, design: .serif)).foregroundStyle(ink).lineLimit(1)
                    Text(s.label)
                        .font(.system(.subheadline, design: .serif)).foregroundStyle(ink2).lineLimit(1)
                    if let line = s.line {
                        LineText(line: line)
                            .font(.system(.footnote, design: .serif)).foregroundStyle(ink2).lineLimit(2)
                    }
                }
                Spacer(minLength: 6)
                Clock(s: s)
                    .font(.system(size: 30, weight: .light, design: .serif))
                    .foregroundStyle(violetHi)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 104, alignment: .trailing)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 16)
            .activityBackgroundTint(night.opacity(0.92))
            .activitySystemActionForegroundColor(violetHi)
        } dynamicIsland: { ctx in
            let s = Shown(ctx.state, stale: ctx.isStale)
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Ring(s: s, size: 40).padding(.leading, 6).padding(.top, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Clock(s: s)
                        .font(.system(size: 26, weight: .light, design: .serif))
                        .foregroundStyle(violetHi)
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 96, alignment: .trailing)
                        .padding(.top, 8)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(ctx.attributes.job)
                        .font(.system(.headline, design: .serif)).foregroundStyle(ink).lineLimit(1)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 2) {
                        Text(s.label).font(.system(.subheadline, design: .serif)).foregroundStyle(ink2)
                        if let line = s.line {
                            LineText(line: line).font(.system(.caption, design: .serif)).foregroundStyle(ink2).lineLimit(1)
                        }
                    }
                }
            } compactLeading: {
                Ring(s: s, size: 18)
            } compactTrailing: {
                Clock(s: s)
                    .font(.system(size: 14, weight: .medium).monospacedDigit())
                    .foregroundStyle(violetHi)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 46, alignment: .trailing)
            } minimal: {
                Ring(s: s, size: 18)
            }
            .keylineTint(violet)
        }
    }
}
