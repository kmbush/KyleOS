// Writing: a list of publication cards that link out, outlet in an accent color.
import { accentAt } from "../lib/accents";
import { useContent } from "../lib/useContent";

export function Writing() {
  const { publications } = useContent();
  return (
    <>
      {publications.map((pub, i) => (
        <a
          key={pub.id}
          href={pub.url}
          target="_blank"
          rel="noopener"
          className="mb-[10px] block rounded-[11px] border border-line p-[15px] text-fg"
        >
          <div className="mb-2 flex justify-between font-mono text-[11px]">
            <span style={{ color: accentAt(i) }}>{pub.outlet}</span>
            <span className="text-fg-faint">{pub.date}</span>
          </div>
          <div className="text-[15px] font-medium leading-[1.35]">{pub.title}</div>
        </a>
      ))}
    </>
  );
}
