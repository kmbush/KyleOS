// Ambient desktop widgets: the clock/date card and status card (top-right), and
// the rotated amber sticky-note bio (bottom-left). Chrome copy is fixed; the
// location and bio come from content so an edit is reflected here too.
import { useClock } from "../../lib/useClock";
import { useContent } from "../../lib/useContent";

const CARD = "color-mix(in oklch, var(--bg2) 74%, transparent)";

export function AmbientWidgets() {
  const { hero } = useContent();
  const { time, date } = useClock(hero.timezone);

  return (
    <>
      <div className="absolute top-[60px] right-[26px] z-[1] flex w-[260px] flex-col gap-[14px]">
        <div
          className="rounded-[15px] border border-line px-5 py-[18px] backdrop-blur-[12px]"
          style={{ background: CARD }}
        >
          <div className="font-mono font-medium tracking-[-0.02em] text-[clamp(30px,3vw,42px)]">
            {time}
          </div>
          <div className="mt-1 font-mono text-xs text-fg-dim">
            {date} · {hero.location}
          </div>
        </div>

        <div
          className="rounded-[15px] border border-line px-[18px] py-4 backdrop-blur-[12px]"
          style={{ background: CARD }}
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-xs text-fg-dim">
            <span
              className="size-[7px] rounded-full bg-moss"
              style={{ animation: "pulse 2.4s ease-in-out infinite" }}
            />
            status
          </div>
          <p className="m-0 text-sm leading-[1.5]">Available for interesting cloud problems.</p>
          <p className="mt-[11px] mb-0 font-mono text-[11px] text-fg-faint">
            focus: Well-Architected reviews
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-24 left-[clamp(20px,4vw,54px)] z-[1] w-[288px] rotate-[-1.4deg] rounded-md px-[22px] py-5"
        style={{
          background: "var(--sticky-bg)",
          color: "var(--sticky-fg)",
          boxShadow: "0 22px 45px -22px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div className="mb-[9px] font-mono text-[11px] uppercase tracking-[0.1em] opacity-60">
          {"// hey, i'm"}
        </div>
        <div className="font-display text-[26px] font-bold leading-none tracking-[-0.02em]">
          {hero.name}
        </div>
        <p className="mt-[11px] mb-0 text-[13.5px] font-medium leading-[1.55]">{hero.sticky}</p>
      </div>
    </>
  );
}
