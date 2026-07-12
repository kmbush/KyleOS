// Life: a two-column grid of hobby cards, each with an accent dot.
import { accentAt } from "../lib/accents";
import { useContent } from "../lib/useContent";

export function Life() {
  const { hobbies } = useContent();
  return (
    <div className="grid grid-cols-2 gap-[11px]">
      {hobbies.map((hobby, i) => (
        <div key={hobby.id} className="rounded-[11px] border border-line p-4">
          <span
            className="mb-[11px] inline-block size-[9px] rounded-full"
            style={{ background: accentAt(i) }}
          />
          <h3 className="m-0 mb-[7px] text-base font-semibold">{hobby.name}</h3>
          <p className="m-0 text-[13px] leading-[1.55] text-fg-dim">{hobby.note}</p>
        </div>
      ))}
    </div>
  );
}
