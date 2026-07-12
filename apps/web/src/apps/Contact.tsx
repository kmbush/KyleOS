// Contact: the closing line and a message form. Not wired to a backend yet —
// Phase 4 connects it to POST /contact and removes the prototype confirmation.
import { useState } from "react";
import { GitHubMark, LinkedInMark } from "../components/SocialIcons";
import { useContent } from "../lib/useContent";
import { useIsMobile } from "../lib/useIsMobile";

export function Contact() {
  const { contact } = useContent();
  const isMobile = useIsMobile();
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="py-[26px] text-center">
        <div className="mx-auto mb-4 grid size-[52px] place-items-center rounded-[14px] bg-moss text-2xl text-ink">
          ✓
        </div>
        <h2 className="m-0 mb-2 font-display text-[22px] font-semibold">Message ready to send</h2>
        <p className="mx-auto mb-5 max-w-[36ch] text-sm leading-[1.6] text-fg-dim">
          This form isn't connected to a backend in the prototype — wire it up when the app ships.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="rounded-[9px] border border-line px-[18px] py-[10px] text-[13px]"
        >
          Compose another
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="m-0 mb-1.5 font-display font-bold tracking-[-0.02em] text-[clamp(22px,3vw,30px)]">
        {contact.note}
      </h2>
      <p className="m-0 mb-[18px] text-[13.5px] text-fg-dim">
        Drop me a line — I'll get back to you.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        className="grid gap-[10px]"
      >
        <div className="grid grid-cols-2 gap-[10px]">
          <input type="text" required placeholder="Your name" className="field" />
          <input type="email" required placeholder="Your email" className="field" />
        </div>
        <input type="text" placeholder="Subject" className="field" />
        <textarea required placeholder="Your message" className="field min-h-[120px]" />
        <button
          type="submit"
          className="rounded-[9px] bg-moss px-3 py-3 font-display text-sm font-semibold text-ink"
        >
          Send message
        </button>
      </form>
      {isMobile && (
        <div className="mt-5 flex gap-3">
          <a
            href={contact.github}
            target="_blank"
            rel="noopener"
            title="GitHub"
            className="grid size-11 place-items-center rounded-xl border border-line text-fg-dim"
          >
            <GitHubMark size={22} />
          </a>
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noopener"
            title="LinkedIn"
            className="grid size-11 place-items-center rounded-xl border border-line text-fg-dim"
          >
            <LinkedInMark size={22} />
          </a>
        </div>
      )}
    </>
  );
}
