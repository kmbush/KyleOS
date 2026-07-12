// Certifications: a two-column grid of cards, each with an accent-outlined badge.
import { accentAt } from "../lib/accents";
import { useContent } from "../lib/useContent";

export function Certs() {
  const { certs } = useContent();
  return (
    <div className="grid grid-cols-2 gap-[11px]">
      {certs.map((cert, i) => (
        <div key={cert.id} className="rounded-[11px] border border-line p-[15px]">
          <div className="mb-3 flex items-center justify-between">
            <span
              className="grid size-[28px] place-items-center rounded-[7px] font-mono text-xs"
              style={{ color: accentAt(i), border: `1px solid ${accentAt(i)}` }}
            >
              ✓
            </span>
            <span className="font-mono text-[11px] text-fg-faint">{cert.year}</span>
          </div>
          <h3 className="m-0 mb-1 text-sm font-semibold leading-[1.3]">{cert.name}</h3>
          <p className="m-0 text-xs text-fg-dim">{cert.issuer}</p>
        </div>
      ))}
    </div>
  );
}
