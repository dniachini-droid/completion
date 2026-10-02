import ActivityKit
import SwiftUI
import WidgetKit

/// The delve's panel on the lock screen and in the Dynamic Island (D-095). Still, as Apple requires: the countdown and
/// the filling ring are the only motion, and the phone ticks both itself. Pause and Finish here stay in the app; a tap
/// opens it.
@main
struct LiveActivityBundle: WidgetBundle {
    var body: some Widget { DelveLiveActivity() }
}

/* direction D's colours: the violet light and the night behind it (ui/direction.css) */
private let violet = Color(red: 0x8f / 255, green: 0x86 / 255, blue: 0xff / 255)
private let violetHi = Color(red: 0xd9 / 255, green: 0xd6 / 255, blue: 0xff / 255)
private let night = Color(red: 0x05 / 255, green: 0x05 / 255, blue: 0x0c / 255)
/* paused (Dan): red, so a glance tells a stopped delve from a running one */
private let red = Color(red: 0xff / 255, green: 0x5a / 255, blue: 0x5a / 255)
private let redHi = Color(red: 0xff / 255, green: 0xb4 / 255, blue: 0xb4 / 255)

/// What the panel shows at this moment: what the app last said, or, once that ran out with the app closed
/// (the system marks the panel stale), what the app said comes after.
private struct Shown {
    enum Clock {
        case running(ClosedRange<Date>)
        case still(Double, String)
        case over
    }
    var label: String
    var place: String
    var job: String
    var line: String
    var left: String
    var clock: Clock
    /// The 5-minute mark on the ring, while a delve runs or is paused (a fraction of the delve), or nil.
    var notch: Double?
    /// The panel's colour: violet while the delve runs, red while it is paused.
    var accent: Color { if case .still = clock { return red } else { return violet } }
    var accentHi: Color { if case .still = clock { return redHi } else { return violetHi } }

    init(_ s: DelveAttributes.ContentState, stale: Bool) {
        place = s.place
        job = s.job
        if !stale || s.phase == "held" {
            label = s.label
            line = s.line
            left = s.left
            clock = s.phase == "held" ? .still(s.heldFraction, s.heldTime) : .running(s.start...max(s.start, s.end))
            if s.phase != "breather", let n = s.notch, n > 0, n < 1 { notch = n }
        } else {
            label = s.afterLabel
            line = s.afterLine
            left = s.afterLeft
            if let a = s.afterStart, let b = s.afterEnd, b > a { clock = .running(a...b) } else { clock = .over }
        }
    }
}

/// The ring, filling as the delve goes (the system fills it; no app code runs).
private struct Ring: View {
    let s: Shown
    var clock: Shown.Clock { s.clock }
    var body: some View {
        Group {
            switch clock {
            case .running(let span):
                ProgressView(timerInterval: span, countsDown: false) { EmptyView() } currentValueLabel: { EmptyView() }
            case .still(let fraction, _):
                ProgressView(value: fraction)
            case .over:
                ProgressView(value: 1)
            }
        }
        .progressViewStyle(.circular)
        .tint(s.accent)
        .shadow(color: s.accent.opacity(0.7), radius: 4)
        /* the 5-minute mark: a small notch where the delve starts to count (MORNING-REPORT Part 3 #6) */
        .overlay {
            if let n = s.notch {
                GeometryReader { g in
                    Capsule()
                        .fill(Color.white.opacity(0.85))
                        .frame(width: 2, height: 6)
                        .offset(y: -min(g.size.width, g.size.height) / 2 + 3)
                        .rotationEffect(.degrees(n * 360))
                        .frame(width: g.size.width, height: g.size.height)
                }
            }
        }
    }
}

/// The time left: counting down by itself, still (and red) while paused, a quiet mark once over.
private struct Countdown: View {
    let s: Shown
    var clock: Shown.Clock { s.clock }
    let size: CGFloat
    let width: CGFloat
    var body: some View {
        Group {
            switch clock {
            case .running(let span):
                Text(timerInterval: span, countsDown: true)
            case .still(_, let time):
                Text(time)
            case .over:
                Text(Image(systemName: "checkmark"))
            }
        }
        .font(.system(size: size, weight: .light, design: .serif))
        .monospacedDigit()
        .foregroundStyle(s.accentHi)
        .multilineTextAlignment(.trailing)
        .lineLimit(1)
        .frame(width: width, alignment: .trailing)
    }
}

/// The lock screen: the violet light and its ring, the place, the job, and the time left.
private struct LockScreen: View {
    let s: Shown
    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            ZStack {
                Circle()
                    .fill(RadialGradient(colors: [s.accent.opacity(0.55), s.accent.opacity(0.12), .clear],
                                         center: .center, startRadius: 2, endRadius: 46))
                    .frame(width: 92, height: 92)
                Ring(s: s).frame(width: 50, height: 50)
            }
            .frame(width: 58, height: 58)

            VStack(alignment: .leading, spacing: 2) {
                Text(s.label.uppercased())
                    .font(.system(size: 11, weight: .semibold))
                    .kerning(1.6)
                    .foregroundStyle(s.accent)
                Text(s.place)
                    .font(.system(size: 19, weight: .regular, design: .serif))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
                Text(s.job)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.white.opacity(0.85))
                    .lineLimit(1)
                Text(s.line)
                    .font(.system(size: 13, design: .serif).italic())
                    .foregroundStyle(.white.opacity(0.6))
                    .lineLimit(2)
            }

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 2) {
                Countdown(s: s, size: 30, width: 92)
                if !s.left.isEmpty {
                    Text(s.left)
                        .font(.system(size: 11))
                        .foregroundStyle(.white.opacity(0.5))
                        .multilineTextAlignment(.trailing)
                        .lineLimit(2)
                        .frame(width: 92, alignment: .trailing)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}

struct DelveLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DelveAttributes.self) { context in
            let s = Shown(context.state, stale: context.isStale)
            return LockScreen(s: s)
                .activityBackgroundTint(night)
                .activitySystemActionForegroundColor(s.accent)
        } dynamicIsland: { context in
            let s = Shown(context.state, stale: context.isStale)
            return DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Ring(s: s).frame(width: 40, height: 40).padding(.leading, 6)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Countdown(s: s, size: 26, width: 84).padding(.trailing, 6)
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 1) {
                        Text(s.label.uppercased())
                            .font(.system(size: 10, weight: .semibold))
                            .kerning(1.4)
                            .foregroundStyle(s.accent)
                        Text(s.place)
                            .font(.system(size: 16, design: .serif))
                            .foregroundStyle(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.75)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("\(s.job) · \(s.line)")
                        .font(.system(size: 13, design: .serif).italic())
                        .foregroundStyle(.white.opacity(0.7))
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
            } compactLeading: {
                Ring(s: s).frame(width: 20, height: 20)
            } compactTrailing: {
                Countdown(s: s, size: 14, width: 44)
            } minimal: {
                Ring(s: s).frame(width: 20, height: 20)
            }
            .keylineTint(s.accent)
        }
    }
}
