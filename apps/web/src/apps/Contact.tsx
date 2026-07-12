// Contact: the closing line and a message form wired to POST /contact. A hidden
// `company` honeypot field (DESIGN §8) lets the Lambda drop bots silently.
import { type FormEvent, useState } from "react";
import { GitHubMark, LinkedInMark } from "../components/SocialIcons";
import { postContact } from "../lib/api";
import { useContent } from "../lib/useContent";
import { useIsMobile } from "../lib/useIsMobile";

export function Contact() {
  const { contact } = useContent();
  const isMobile = useIsMobile();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      await postContact({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        subject: String(data.get("subject") ?? ""),
        message: String(data.get("message") ?? ""),
        company: String(data.get("company") ?? ""), // honeypot — real users leave it blank
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="py-[26px] text-center">
        <div className="mx-auto mb-4 grid size-[52px] place-items-center rounded-[14px] bg-moss text-2xl text-ink">
          ✓
        </div>
        <h2 className="m-0 mb-2 font-display text-[22px] font-semibold">Message sent</h2>
        <p className="mx-auto mb-5 max-w-[36ch] text-sm leading-[1.6] text-fg-dim">
          Thanks — I'll get back to you soon.
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
      <form onSubmit={submit} className="grid gap-[10px]">
        <div className="grid grid-cols-2 gap-[10px]">
          <input type="text" name="name" required placeholder="Your name" className="field" />
          <input type="email" name="email" required placeholder="Your email" className="field" />
        </div>
        <input type="text" name="subject" placeholder="Subject" className="field" />
        <textarea
          name="message"
          required
          placeholder="Your message"
          className="field min-h-[120px]"
        />
        {/* Honeypot: hidden from people, tempting to bots (DESIGN §8). */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-[9px] bg-moss px-3 py-3 font-display text-sm font-semibold text-ink disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
        {error && <p className="m-0 font-mono text-xs text-berry">{error}</p>}
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
