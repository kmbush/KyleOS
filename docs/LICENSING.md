# KyleOS — Licensing and Attribution

What this repo is licensed under, what it borrows, and what it must ship to stay compliant.

---

## Structure

```
LICENSE                            # MIT — all first-party code
NOTICE                             # third-party attributions, one place
fonts/
  space-grotesk/
    SpaceGrotesk-*.woff2
    OFL.txt                        # REQUIRED — SIL OFL 1.1
  jetbrains-mono/
    JetBrainsMono-*.woff2
    LICENSE                        # REQUIRED — Apache 2.0
```

---

## 1. Code — MIT

All first-party code in this repository is **MIT licensed**.

**Why MIT and not Apache 2.0:** Apache 2.0's advantage is its express patent grant, which matters for a product someone might build a business on. This is a personal site. MIT is shorter, more permissive, universally understood, and the norm for something people fork as a starting point. Nothing here is patentable and nothing here needs a CLA.

**Why permissive at all:** the repo is a portfolio piece. Its job is to be read, copied, and learned from. A restrictive license would work against the only thing it exists to do.

---

## 2. Fonts — third-party, and **this is the compliance item that bites**

Both fonts are **self-hosted** (per DESIGN.md §12 — no Google Fonts CDN, no Google dependency). Self-hosting means we are **distributing** the font files, which triggers the attribution requirements in their licenses. Linking to a CDN would not have.

| Font | License | Requirement |
|---|---|---|
| **Space Grotesk** (400/500/600/700) | SIL Open Font License 1.1 | The **full OFL text must ship with the font files.** Copyright notice must be preserved. The fonts may not be sold on their own. |
| **JetBrains Mono** (400/500/600) | Apache License 2.0 | The **full license text must be included.** Copyright and attribution notices must be preserved. |

**Both licenses require shipping the license text. This is not optional and it is not a formality.** It is the single most commonly missed compliance item in projects that self-host fonts, and the whole reason this document exists.

Ship the license files. Do not summarize them, do not link to them elsewhere, do not put them only in `NOTICE`. The full text, in the font directory, next to the font files.

---

## 3. Dependencies

The runtime dependency list is closed (DESIGN.md §9) and every item is permissively licensed (MIT / Apache 2.0 / BSD). Anything added later requires an ADR — and the ADR must state the license.

**Anything copyleft (GPL, AGPL, LGPL) is a BLOCK.** Not a discussion. It is incompatible with shipping this as MIT.

**Generate `NOTICE` from the actual dependency tree**, don't hand-write it:

```bash
npx license-checker --production --summary
```

---

## 4. Content — not licensed, not in the repo

Kyle's bio, project write-ups, and screenshots are **not in this repository** (ADR-002). They live in S3 and are entered through the admin editor.

What ships is `content.example.json` — fictional placeholder content, covered by the MIT license along with everything else.

This means the MIT license applies cleanly to the entire repository with no carve-outs, because there is nothing personal in it to carve out. The separation of content from code was made for architectural reasons; it happens to make the licensing trivially clean as well.

The README should say this plainly: **fork the OS, not the résumé.**

---

## 5. AI-assisted authorship — the honest position

KyleOS was designed in Claude Design and built with Claude Code. Kyle made every architectural decision; a substantial amount of the code was AI-generated.

**Position taken:** the README says so, plainly and without apology. It is honest, it is increasingly unremarkable, and hiding it would be both dishonest and pointless.

**On the copyright question:** purely machine-generated material may not carry copyright protection in the US, as it lacks the human authorship the statute requires. Human contributions — selection, arrangement, direction, modification, architecture — remain protectable. In practice this is a non-issue for a repository being given away under MIT: weak copyright on code you are deliberately handing to strangers costs nothing.

**Not legal advice.** If it ever matters, ask a lawyer.

---

## 6. Prior art

"Portfolio as an operating system" is a genre, not an invention. Kyle is not the first and the README says so.

**No specific project was studied while building this** — the design was made from scratch in Claude Design. Listing influences that were not actually influences would be performative and false.

So the README gives an honest blanket acknowledgment of the genre and a clear statement of what this one does differently (mobile as a genuinely separate OS shell; a real editable-content backend; the infrastructure as the actual point). It does not name-check projects it did not learn from.

**If that ever changes — if a specific project is looked at and borrowed from — name it, link it, and be specific.** That is the only attribution worth anything.

---

## Compliance checklist — Phase 6 review gate

- [ ] `LICENSE` exists at the repo root, MIT, with the correct year and name
- [ ] `NOTICE` exists and is **generated from the real dependency tree**, not hand-written
- [ ] `fonts/space-grotesk/OFL.txt` — **full text**, shipped
- [ ] `fonts/jetbrains-mono/LICENSE` — **full text**, shipped
- [ ] No copyleft (GPL/AGPL/LGPL) anywhere in the production dependency tree
- [ ] `package.json` declares `"license": "MIT"`
- [ ] README states the license, links the font licenses, and says the content is not covered
- [ ] README acknowledges prior art and AI assistance honestly
