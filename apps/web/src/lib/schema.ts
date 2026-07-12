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
    tagline: string;
    sticky: string; // sticky-note bio, bottom-left
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
    tagstr: string; // "Go · CDK · Policy-as-Code" — split on '·' into pills
    desc: string;
    repo: string; // '' hides the "code ↗" link
    live: string; // '' hides the "live ↗" link
    image?: string; // S3 key for the 16:10 screenshot slot
  }>;
  publications: Array<{ id: string; title: string; outlet: string; date: string; url: string }>;
  certs: Array<{ id: string; name: string; issuer: string; year: string }>;
  hobbies: Array<{ id: string; name: string; note: string }>;
  contact: {
    note: string;
    email: string;
    github: string;
    linkedin: string;
    blog: string;
  };
}
