# Handoff: KyleOS — Portfolio "Desktop OS"

## Overview
A personal portfolio for **Kyle Bush** (Senior Solutions Architect @ AWS, classically-trained software engineer) reimagined as a tiny **operating system**. On desktop it's a windowed desktop environment (draggable app windows, a dock, a working menu bar, Spotlight search); on phones/tablets it collapses into an **iPhone-style springboard** (app grid + bottom dock, full-screen app sheets). The whole thing supports **light/dark themes** and a hidden **owner content-editor** behind a mock 2FA login.

PNW-moody but techy: deep "blue-hour" ink palette with four vibrant accents (evergreen, glacier, huckleberry, cedar), Space Grotesk + JetBrains Mono type, dot-grid wallpaper, a giant "KB" watermark.

## About the Design Files
The file in this bundle — `KyleOS.dc.html` — is a **design reference created in HTML** (a working prototype showing intended look and behavior). It is **not production code to ship directly**. It's authored in a bespoke "Design Component" runtime (`support.js`, `<x-dc>` templates, `sc-for`/`sc-if`, a `Component extends DCLogic` class) that exists only in the prototyping tool.

**Your task:** recreate this experience in the target codebase's environment using its established patterns. If there's no codebase yet, **React + TypeScript** is the natural fit (the logic is already effectively a React class component). Vite + React + CSS variables (or Tailwind) will reproduce this cleanly. Treat `KyleOS.dc.html` as the spec for layout, tokens, copy, and behavior — re-implement, don't transpile.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, animations, and interactions are all final and intentional. Recreate pixel-faithfully. Everything is inline-styled in the prototype (a runtime constraint) — in a real codebase, lift these into CSS variables / a theme and components.

---

## Design Tokens

Themes are applied by setting CSS custom properties on a root element. Two themes:

### Dark (default)
```
--bg:        #0a0d12   /* app background */
--bg2:       #101620   /* surfaces: windows, dock, cards */
--bg3:       #18202c   /* raised / hover surfaces */
--line:      rgba(210,222,240,0.12)   /* borders, dividers */
--fg:        #eef2f7   /* primary text */
--fg-dim:    rgba(238,242,247,0.62)   /* secondary text */
--fg-faint:  rgba(238,242,247,0.40)   /* tertiary / labels */
--moss:      oklch(0.82 0.16 150)     /* accent 1 — evergreen (primary) */
--glacier:   oklch(0.81 0.13 220)     /* accent 2 — glacier blue */
--berry:     oklch(0.72 0.19 330)     /* accent 3 — huckleberry */
--amber:     oklch(0.83 0.14 78)      /* accent 4 — cedar */
--link:      oklch(0.81 0.13 220)
```

### Light
```
--bg:        #eef2f7
--bg2:       #ffffff
--bg3:       #eef1f6
--line:      rgba(12,18,28,0.12)
--fg:        #0f141b
--fg-dim:    rgba(15,20,27,0.64)
--fg-faint:  rgba(15,20,27,0.42)
--moss:      oklch(0.55 0.16 150)
--glacier:   oklch(0.52 0.14 224)
--berry:     oklch(0.52 0.2 330)
--amber:     oklch(0.6 0.14 70)
--link:      oklch(0.52 0.14 224)
```

Accents cycle in the order **[moss, glacier, berry, amber]** across repeated items (project cards, cert cards, fact chips, publication tags), indexed by position modulo 4.

### Typography
- **Display / headings:** `Space Grotesk` (weights 400/500/600/700). Google Fonts.
- **UI labels / data / mono:** `JetBrains Mono` (400/500/600). Google Fonts.
- Body copy uses Space Grotesk 400.
- Headings use tight tracking (`letter-spacing: -0.02em`), line-height ~1.0–1.15.

### Wallpaper (root background, both themes)
```
radial-gradient(ellipse at 70% -10%, color-mix(in oklch, var(--glacier) 20%, transparent), transparent 55%),
radial-gradient(ellipse at 12% 108%, color-mix(in oklch, var(--moss) 15%, transparent), transparent 50%),
linear-gradient(180deg, var(--bg3), var(--bg))
```
Plus a dot-grid overlay: `radial-gradient(var(--line) 1px, transparent 1px)` at `background-size: 30px 30px; opacity: .45`.

### Radii / shadows / motion
- Radii: windows 14px, cards/inputs 8–13px, dock 20px (desktop) / 30px (mobile), app icons 13–16px, pills 20px.
- Window shadow: `0 30px 70px -28px rgba(0,0,0,0.7)`.
- Dock/overlay shadow: `0 20px 50px -20px rgba(0,0,0,0.6)`; blur via `backdrop-filter: blur(16–22px)` on `color-mix(in oklch, var(--bg2) 58–72%, transparent)`.
- Window open: `winIn` keyframe — `opacity 0→1, translateY(10px)→0, scale(.98)→1`, `.25–.28s cubic-bezier(.16,1,.3,1)`.
- Menu dropdown: `menuIn` — fade + translateY(-4px), `.16s`.
- Boot bar: `bootBar` — `transform: scaleX(0)→scaleX(1)`, `1.4s cubic-bezier(.4,0,.2,1)`.
- Status pulse dot: `pulse` — opacity 1↔.35, 2.4s.

---

## Global Chrome (desktop)

### Boot sequence
On load, a full-screen overlay (`z-index 2000`) over a dark gradient shows: a 64px moss-tiled "K" logo (glow `0 0 55px -6px var(--moss)`), the caption `booting KyleOS` (mono, uppercase, letter-spacing .24em), and a 180×3px progress bar filling left-to-right. Dismisses after **1500ms**. On desktop it then auto-opens the **Help** window; on mobile it does not.

### Menu bar (desktop, fixed top, height 36px)
`color-mix(in oklch, var(--bg2) 68%, transparent)` + blur, bottom border `--line`. Left→right:
- `◆ KyleOS` (bold) — dropdown: **About KyleOS**, **Help**, **Toggle theme** (⌘T/CtrlT), **Restart**.
- `File` — **Close all windows**, **Reset desktop** (restores icon positions + closes windows).
- `View` — **Dark theme**, **Light theme**.
- `Go` — opens any section (About/Writing/Certifications/Life/Contact) or any project `.app`.
- Right cluster (mono, `--fg-dim`): **GitHub** + **LinkedIn** icon buttons (28px, rounded 8px, 1px `--line` border, SVG glyph in `currentColor`; hover → `--bg3` bg, `--moss` border, `--fg` icon); a "●●●○" wifi glyph; a **search** button (⌕ glyph, opens Spotlight); a **theme toggle** (☽/☀); and the **live clock** (`HH:MM AM/PM`, updates every 15s).
- All menu-bar buttons show a `--bg3` hover highlight and pointer cursor.

### Desktop project icons (top-left)
Each project is a **draggable desktop file**: a 60px rounded-14px `--bg2` tile with a 5px top accent stripe and a mono glyph in the project's accent color, plus a label chip below. **Double-click opens** the project window; **drag** repositions (persisted in component state, reset via File → Reset desktop). Default layout: a horizontal row starting `x:28, y:52`, `112px` apart.

### Ambient widgets (right)
- **Clock/date card:** large mono time + `Weekday, Mon D · Seattle, WA`.
- **Status card:** pulsing moss dot + "Available for interesting cloud problems." + `focus: …` line.
- **Sticky-note bio** (bottom-left): amber note, rotated -1.4°, "// hey, i'm" kicker + name + short bio.
- **"KB" watermark** (bottom-right): giant Space Grotesk 700 at `color-mix(--fg 5%)`, "Pacific Northwest" mono caption.

### Dock (desktop, bottom-center)
Rounded-20px blurred bar. Five app tiles (48px rounded-13px, accent-tinted, mono glyph, label below, open-indicator dot): **About, Writing, Certs, Life, Contact**. Hover lifts the tile (`translateY(-7px)`). Minimized windows appear as pills after a divider.

### Windows
Absolutely-positioned, draggable by the title bar, with a **traffic-light** cluster (14px dots): **red = close, amber = minimize (to a dock pill), green = maximize/restore**. Glyphs (× − +) are hidden and fade in **only on the individually-hovered light**. Title bar shows the window title in mono. Body scrolls. Focus (mousedown) raises z-index. Maximize fills the viewport minus margins; restore returns to prior geometry.

### Spotlight (⌘K / Ctrl+K, or the ⌕ button)
Centered overlay (blurred scrim). Mono `⌘K` badge + text input. Fuzzy-filters a list of **sections + projects + "Toggle theme" + "Help"**; ↑/↓ move the highlighted row, Enter opens it, Esc closes. Hovering a row highlights it. Hotkey label adapts to OS (⌘ on Mac, Ctrl elsewhere — detect via `navigator.platform`/`userAgent`).

---

## Screens / Views (app content — shared desktop + mobile)

Each "app" renders the same content in a desktop window or a mobile full-screen sheet.

- **README / About KyleOS (info):** role kicker (`// {role}`), big name, tagline, note.
- **About:** heading (Space Grotesk ~24px), 1–3 body paragraphs (`--fg-dim`, line-height 1.7), then a 2-col grid of **fact chips** (mono uppercase label + value), each with an accent.
- **Experience/timeline:** (present in the vertical-site variant; KyleOS folds experience into About — omit unless desired.)
- **Selected Work (projects):** each project = name, an accent left-stripe card with tags (mono pills split on `·`), a 16:10 **screenshot slot** (user-supplied image), a description paragraph, and **code / live** links (open in new tab; "live" only if present).
- **Writing (publications):** list of cards — outlet (accent) + date (mono), title; each links out (new tab); hover lifts + accent border.
- **Certifications:** 2-col grid of cards — accent-outlined ✓ badge, year (mono), name, issuer.
- **Life (hobbies):** 2-col grid of cards — accent dot, name, note.
- **Contact:** heading (closing line) + "Drop me a line" + a **message form** (name, email, subject, message, Send). Send currently shows a prototype confirmation ("Message ready to send — not wired to a backend"). **On mobile only,** GitHub + LinkedIn icon buttons appear beneath the form.
- **Help:** "Welcome to KyleOS" + a legend explaining dock, project files, window controls, Spotlight (OS-aware hotkey), and the menu bar.
- **Content Editor:** see below (hidden).

### Default content (placeholders — all editable)
- Name "Kyle Bush", role "Senior Solutions Architect @ AWS", location "Seattle, WA".
- 5 projects (Cedar, Fogline, driftwood, Trailhead CLI, KyleOS) with tags/descriptions/repo/live.
- 3 publications, 4 certs (AWS SA-Pro, DevOps-Pro, Security, CKA), 4 hobbies.
- Social URLs are placeholders (`https://github.com/`, `https://linkedin.com/`).

---

## Mobile / Tablet (≤ 820px viewport)

Fundamentally different shell (no windows/dock-drag/minimize):
- **Status bar** (fixed top, 40px): clock left; theme toggle + wifi + battery glyphs right.
- **Springboard home:** app **grid** (4-col) of projects + Help on the wallpaper; a **KB watermark** sits above the app bar (not behind it); a floating **bottom dock** (rounded-30px, blurred) with five fixed apps: **About, Writing, Certs, Life, Contact**.
- **Opening an app** replaces the view with a **full-screen sheet**; the title bar is a mobile header with a `‹` **back chevron** (returns to the springboard). Only one app open at a time.
- Does **not** auto-open Help on boot.
- Switch desktop↔mobile is driven by `matchMedia('(max-width: 820px)')` with a resize listener.

---

## Hidden Admin / Content Editor

- **Access is intentionally hidden.** There is no visible "Edit" button. Editing opens only when the URL hash is **`#admin`** (checked on load + on `hashchange`). (⌘E and menu/spotlight entries were removed on purpose.)
- Navigating to `#admin` opens a **mock login**: email + password → **6-digit TOTP** (auto-advancing inputs) → on verify, opens the **Content Editor** app.
- The editor is a left-nav + form covering every section (Profile, About, Work, Writing, Certs, Life, Contact) with add/remove for list items. Edits **autosave to `localStorage`** (`kb_kyleos_v1`) and update the live UI immediately. "Reset all" restores defaults.

> **This login is a prototype gate, not real security** — everything runs client-side. In production, enforce it server-side (see Backend).

---

## Interactions & Behavior (summary)
- Theme toggle: sets CSS variables on the root; persist to localStorage. (In React, drive via a `theme` state + `data-theme` attribute and a CSS-variable stylesheet.)
- Window manager: open/focus/close/minimize/maximize; z-index counter; drag via pointer math (`clientX - offset`), clamped so the title bar stays on-screen.
- Desktop icon drag + double-click-to-open.
- Spotlight fuzzy search with keyboard nav.
- Contact form: client-side required-field validation; submit → confirmation (replace with real POST).
- Clock ticks every 15s.
- Boot overlay one-shot on load.

## State Management
Single component state today: `theme`, `route`/`windows[]` (id, app, title, x, y, w, h, z, minimized, max + saved geometry), `iconPos{}`, `menu`, `spotlight`/`spotQuery`/`spotIndex`, `booting`, `mobile`, `contactSent`, and the editable `content` object (hero, about{heading, body[], facts[]}, projects[], publications[], certs[], hobbies[], contact). Auth: `authed`, `login`, `loginStep`, `editSection`.

In a real app: split into a `useTheme`, a `useWindowManager`, a `content` store (fetched from an API), and route `#admin` to a guarded editor.

## Backend requirements (for real deployment)
1. **Content store** — serve the `content` object from an API (DynamoDB/S3 behind API Gateway + Lambda, or any CMS). The editor should PUT changes; the site GETs on load. Replace localStorage.
2. **Auth for the editor** — real authentication + MFA. Given AWS: **Cognito hosted UI + TOTP MFA**; gate the editor route and the content-write API with the Cognito authorizer. The `#admin` hash + mock 2FA screen are placeholders for this flow.
3. **Contact form** — wire "Send" to an endpoint (API Gateway + Lambda → SES, or a form service). Add spam protection.
4. **Image slots** — project screenshots + portrait are drag-and-drop placeholders in the prototype; back them with real uploaded assets (S3).

## Assets
- **Fonts:** Space Grotesk + JetBrains Mono (Google Fonts).
- **Icons:** GitHub & LinkedIn marks are inline single-path SVGs (in the file); swap for your icon library if preferred. All other "icons" are Unicode glyphs.
- **Images:** none shipped — project/portrait images are user-supplied via drop slots (`image-slot.js` in the prototype). Use your own upload/asset pipeline.
- No raster assets to extract.

## Files
- `KyleOS.dc.html` — the full prototype (template + logic + all content). Primary reference.
- `image-slot.js` — the drag-and-drop image-slot web component used for screenshots/portrait (prototype dependency; replace with your asset handling).
- Note: the prototype also has sibling concepts (`TerminalOS.dc.html` interactive shell, and a vertical-scroll `Portfolio.dc.html`) that were explored earlier — **KyleOS is the chosen direction.** Ask if you want those included.
