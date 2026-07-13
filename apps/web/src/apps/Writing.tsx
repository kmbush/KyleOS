// Writing: publication cards that link out. Each outlet keeps one accent colour —
// keyed by the outlet's first appearance, so every "AWS Blog" entry reads the same
// instead of cycling by row.
import { accentAt } from "../lib/accents";
import { useContent } from "../lib/useContent";

export function Writing() {
  const { publications } = useContent();
  const outlets = [...new Set(publications.map((pub) => pub.outlet))];
  return (
    <>
      {publications.map((pub) => (
        <a
          key={pub.id}
          href={pub.url}
          target="_blank"
          rel="noopener"
          className="mb-[10px] block rounded-[11px] border border-line p-[15px] text-fg"
        >
          <div className="mb-2 flex justify-between font-mono text-[11px]">
            <span style={{ color: accentAt(outlets.indexOf(pub.outlet)) }}>{pub.outlet}</span>
            <span className="text-fg-faint">{pub.date}</span>
          </div>
          <div className="text-[15px] font-medium leading-[1.35]">{pub.title}</div>
        </a>
      ))}
    </>
  );
}
