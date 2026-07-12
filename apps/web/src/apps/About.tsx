// About: heading, body paragraphs, and a two-column grid of fact chips.
import { useContent } from "../lib/useContent";

export function About() {
  const { about } = useContent();
  return (
    <>
      <h2 className="m-0 mb-4 font-display text-2xl font-semibold tracking-[-0.01em]">
        {about.heading}
      </h2>
      {about.body.map((p) => (
        <p key={p.id} className="m-0 mb-[14px] text-sm leading-[1.7] text-fg-dim">
          {p.text}
        </p>
      ))}
      <div className="mt-1.5 grid grid-cols-2 gap-[10px]">
        {about.facts.map((fact) => (
          <div key={fact.id} className="rounded-[10px] border border-line p-[13px]">
            <p className="m-0 mb-[5px] font-mono text-[10px] uppercase tracking-[0.06em] text-fg-faint">
              {fact.label}
            </p>
            <p className="m-0 text-sm">{fact.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
