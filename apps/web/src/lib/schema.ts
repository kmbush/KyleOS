// The content model: one document that is the contract between the site, the
// editor, and the write API (DESIGN §7). This is the single source of truth for
// the content shape — the Lambda validator derives from it too (DESIGN §8), so
// keep exactly one definition and never fork it.

export interface Content {
  hero: {
    name: string;
    role: string;
    location: string;
    timezone: string; // IANA name (e.g. "America/Los_Angeles") — drives the desktop clock
    sticky: string; // sticky-note bio, bottom-left
    status: string; // desktop status card — the availability line
    focus: string; // desktop status card — current focus, shown after "focus:"
  };
  about: {
    heading: string;
    body: Array<{ id: string; text: string }>;
    facts: Array<{ id: string; label: string; value: string }>;
  };
  projects: Array<{
    id: string;
    name: string;
    glyph: string; // single unicode char — desktop icon, dock, spotlight
    tags: string[]; // e.g. ["Go", "CDK", "Policy-as-Code"] — rendered as pills
    desc: string;
    repo: string; // '' hides the "code ↗" link
    live: string; // '' hides the "live ↗" link
    image?: string; // S3 key for the 16:10 screenshot slot
  }>;
  publications: Array<{ id: string; title: string; outlet: string; date: string; url: string }>;
  certs: Array<{ id: string; name: string; issuer: string; year: string; image?: string }>; // image: S3 key of the credential badge
  hobbies: Array<{ id: string; name: string; note: string }>;
  contact: {
    note: string;
    email: string;
    github: string;
    linkedin: string;
    blog: string;
  };
  // Icon (glyph) overrides for built-in apps, keyed by app id (e.g. "about",
  // "snake"). Missing keys fall back to the app's built-in default. Project icons
  // are edited per-project (projects[].glyph), not here.
  icons?: Record<string, string>;
}
