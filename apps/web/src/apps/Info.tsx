// About KyleOS: the "info" window — version card and a one-paragraph blurb.
import { useContent } from "../lib/useContent";

export function Info() {
  const { hero } = useContent();
  return (
    <div className="pt-2 pb-1 text-center">
      <div className="mx-auto mb-4 grid size-[56px] place-items-center rounded-[14px] bg-moss font-mono text-2xl font-bold text-ink">
        K
      </div>
      <h2 className="m-0 mb-1 font-display text-[22px] font-semibold">KyleOS</h2>
      <p className="m-0 mb-[18px] font-mono text-xs text-fg-faint">version 1.0 · {hero.location}</p>
      <p className="m-0 mx-auto max-w-[38ch] text-sm leading-[1.6] text-fg-dim">
        A portfolio disguised as a desktop. Open the project files, poke around the dock, drag
        things. Everything you'd want to know about {hero.name} is in here somewhere.
      </p>
    </div>
  );
}
