// The content editor (Phase 4, ADR-004): the owner's forever-interface for every
// word on the site — no deploy, no terminal. Left-nav sections, a form for every
// field in the Content model, add/remove on every list, and drop-to-upload project
// screenshots. Shell-agnostic: it renders in a desktop Window or a mobile AppSheet.
//
// Save model: debounced autosave. Each edit writes straight into the query cache
// so it previews live across the whole OS, then a single PUT /content persists once
// typing settles (SAVE_DELAY_MS) — never a request per keystroke. Persistence is
// optimistic with rollback (useSaveContent); the break-glass path (ADR-004) remains
// the ultimate undo.
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { imageUrl, uploadImage } from "../lib/api";
import type { Content } from "../lib/schema";
import { contentQuery, useContent, useSaveContent } from "../lib/useContent";
import { useAuth } from "../stores/useAuth";

const SAVE_DELAY_MS = 800;

const SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "writing", label: "Writing" },
  { id: "certs", label: "Certs" },
  { id: "life", label: "Life" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const uid = () => crypto.randomUUID();
const replaceAt = <T,>(list: T[], index: number, patch: Partial<T>): T[] =>
  list.map((item, i) => (i === index ? { ...item, ...patch } : item));
const removeAt = <T,>(list: T[], index: number): T[] => list.filter((_, i) => i !== index);

type Commit = (next: Content) => void;
interface FormProps {
  content: Content;
  commit: Commit;
}

export function Editor() {
  const content = useContent();
  const queryClient = useQueryClient();
  const save = useSaveContent();
  const signOut = useAuth((s) => s.signOut);
  const [section, setSection] = useState<SectionId>("profile");

  // mutate is stable across renders; a ref lets the unmount flush use it without
  // relisting it as an effect dependency.
  const mutate = useRef(save.mutate);
  mutate.current = save.mutate;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingSave = useRef<Content | null>(null);

  const commit = useCallback<Commit>(
    (next) => {
      queryClient.setQueryData(contentQuery.queryKey, next); // live preview across the OS
      pendingSave.current = next;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        pendingSave.current = null;
        mutate.current(next);
      }, SAVE_DELAY_MS);
    },
    [queryClient],
  );

  // Flush an unsaved edit if the editor closes before the debounce fires.
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (pendingSave.current) mutate.current(pendingSave.current);
    },
    [],
  );

  return (
    <div className="grid grid-cols-[148px_minmax(0,1fr)] gap-[18px]">
      <nav className="flex flex-col gap-[3px]">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-[9px] text-left font-display text-[13px] ${
              s.id === section ? "bg-bg3 text-fg" : "bg-transparent text-fg-dim"
            }`}
          >
            <span className="font-mono text-[10px] opacity-60">{i + 1}</span>
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            signOut();
            if (typeof window !== "undefined") window.location.hash = "";
          }}
          className="mt-3 rounded-lg border border-line bg-transparent p-2 font-mono text-[10px] text-fg-faint"
        >
          sign out
        </button>
      </nav>

      <div>
        <SaveStatus save={save} />
        {section === "profile" && <ProfileForm content={content} commit={commit} />}
        {section === "about" && <AboutForm content={content} commit={commit} />}
        {section === "work" && <WorkForm content={content} commit={commit} />}
        {section === "writing" && <WritingForm content={content} commit={commit} />}
        {section === "certs" && <CertsForm content={content} commit={commit} />}
        {section === "life" && <LifeForm content={content} commit={commit} />}
        {section === "contact" && <ContactForm content={content} commit={commit} />}
      </div>
    </div>
  );
}

function SaveStatus({ save }: { save: ReturnType<typeof useSaveContent> }) {
  const [text, color] = save.isPending
    ? ["saving…", "text-fg-faint"]
    : save.isError
      ? [`save failed — ${(save.error as Error).message}`, "text-berry"]
      : ["changes autosave & appear live", "text-moss"];
  return <p className={`m-0 mb-4 font-mono text-[11px] ${color}`}>● {text}</p>;
}

// --- Reusable form atoms ---------------------------------------------------

function Field({
  label,
  value,
  onChange,
  multiline,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  const id = useId();
  return (
    <div className="grid gap-[5px]">
      <label htmlFor={id} className="text-xs text-fg-dim">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className="field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="field"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ListHeader({ label, onAdd }: { label: string; onAdd: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="font-mono text-[11px] uppercase text-fg-faint">{label}</span>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-[7px] bg-moss px-[11px] py-1.5 text-xs font-semibold text-ink"
      >
        + add
      </button>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      title="Remove"
      onClick={onClick}
      className="w-[34px] flex-none rounded-lg border border-line bg-transparent text-fg-faint"
    >
      ×
    </button>
  );
}

// Tag editor: type a tag and press Enter or comma to add it as a chip; Backspace on
// an empty input removes the last one. Replaces the old '·'-separated text field —
// no special character to hunt for. Duplicates are dropped; a pending draft commits
// on blur so a half-typed tag is never lost to autosave.
function TagsInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const fresh = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (fresh.length) onChange([...tags, ...fresh]);
    setDraft("");
  };
  return (
    <div className="field flex flex-wrap items-center gap-[6px]">
      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-md border border-line px-[7px] py-[2px] font-mono text-[11px] text-fg-dim"
        >
          {tag}
          <button
            type="button"
            title={`Remove ${tag}`}
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="text-fg-faint"
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="min-w-[70px] flex-1 bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-faint"
        placeholder={tags.length ? "" : "Add tags — Enter or comma"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
      />
    </div>
  );
}

// --- Section forms ---------------------------------------------------------

function ProfileForm({ content, commit }: FormProps) {
  const { hero } = content;
  const set = (patch: Partial<Content["hero"]>) =>
    commit({ ...content, hero: { ...hero, ...patch } });
  return (
    <div className="grid gap-3">
      <Field label="Name" value={hero.name} onChange={(v) => set({ name: v })} />
      <Field label="Role" value={hero.role} onChange={(v) => set({ role: v })} />
      <Field label="Location" value={hero.location} onChange={(v) => set({ location: v })} />
      <Field
        label="Timezone (IANA name)"
        value={hero.timezone}
        onChange={(v) => set({ timezone: v })}
      />
      <Field
        label="Sticky-note bio"
        value={hero.sticky}
        onChange={(v) => set({ sticky: v })}
        multiline
      />
      <Field
        label="Status (desktop card)"
        value={hero.status}
        onChange={(v) => set({ status: v })}
      />
      <Field label="Focus (desktop card)" value={hero.focus} onChange={(v) => set({ focus: v })} />
    </div>
  );
}

function AboutForm({ content, commit }: FormProps) {
  const { about } = content;
  const set = (patch: Partial<Content["about"]>) =>
    commit({ ...content, about: { ...about, ...patch } });
  return (
    <div className="grid gap-[14px]">
      <Field
        label="Heading"
        value={about.heading}
        onChange={(v) => set({ heading: v })}
        multiline
      />
      <div>
        <ListHeader
          label="Paragraphs"
          onAdd={() => set({ body: [...about.body, { id: uid(), text: "" }] })}
        />
        {about.body.map((para, i) => (
          <div key={para.id} className="mb-2 flex gap-2">
            <textarea
              className="field"
              placeholder="Paragraph"
              value={para.text}
              onChange={(e) => set({ body: replaceAt(about.body, i, { text: e.target.value }) })}
            />
            <RemoveButton onClick={() => set({ body: removeAt(about.body, i) })} />
          </div>
        ))}
      </div>
      <div>
        <ListHeader
          label="Facts"
          onAdd={() => set({ facts: [...about.facts, { id: uid(), label: "", value: "" }] })}
        />
        {about.facts.map((fact, i) => (
          <div key={fact.id} className="mb-2 grid grid-cols-[1fr_1.3fr_auto] gap-2">
            <input
              className="field"
              placeholder="label"
              value={fact.label}
              onChange={(e) => set({ facts: replaceAt(about.facts, i, { label: e.target.value }) })}
            />
            <input
              className="field"
              placeholder="value"
              value={fact.value}
              onChange={(e) => set({ facts: replaceAt(about.facts, i, { value: e.target.value }) })}
            />
            <RemoveButton onClick={() => set({ facts: removeAt(about.facts, i) })} />
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkForm({ content, commit }: FormProps) {
  const list = content.projects;
  const set = (next: Content["projects"]) => commit({ ...content, projects: next });
  return (
    <>
      <ListHeader
        label="Projects · open as desktop files"
        onAdd={() =>
          set([...list, { id: uid(), name: "", glyph: "", tags: [], desc: "", repo: "", live: "" }])
        }
      />
      {list.map((p, i) => (
        <div key={p.id} className="mb-3 grid gap-[9px] rounded-[11px] border border-line p-[14px]">
          <div className="flex gap-2">
            <input
              className="field font-semibold"
              placeholder="Name"
              value={p.name}
              onChange={(e) => set(replaceAt(list, i, { name: e.target.value }))}
            />
            <RemoveButton onClick={() => set(removeAt(list, i))} />
          </div>
          <div className="grid grid-cols-[70px_1fr] items-start gap-2">
            <input
              className="field text-center"
              placeholder="icon"
              value={p.glyph}
              onChange={(e) => set(replaceAt(list, i, { glyph: e.target.value }))}
            />
            <TagsInput tags={p.tags} onChange={(tags) => set(replaceAt(list, i, { tags }))} />
          </div>
          <textarea
            className="field"
            placeholder="Description"
            value={p.desc}
            onChange={(e) => set(replaceAt(list, i, { desc: e.target.value }))}
          />
          <ImageDrop value={p.image} onChange={(image) => set(replaceAt(list, i, { image }))} />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="field"
              type="url"
              placeholder="Repo URL"
              value={p.repo}
              onChange={(e) => set(replaceAt(list, i, { repo: e.target.value }))}
            />
            <input
              className="field"
              type="url"
              placeholder="Live URL"
              value={p.live}
              onChange={(e) => set(replaceAt(list, i, { live: e.target.value }))}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function WritingForm({ content, commit }: FormProps) {
  const list = content.publications;
  const set = (next: Content["publications"]) => commit({ ...content, publications: next });
  return (
    <>
      <ListHeader
        label="Publications"
        onAdd={() => set([...list, { id: uid(), title: "", outlet: "", date: "", url: "" }])}
      />
      {list.map((pb, i) => (
        <div key={pb.id} className="mb-3 grid gap-[9px] rounded-[11px] border border-line p-[14px]">
          <div className="flex gap-2">
            <input
              className="field font-semibold"
              placeholder="Title"
              value={pb.title}
              onChange={(e) => set(replaceAt(list, i, { title: e.target.value }))}
            />
            <RemoveButton onClick={() => set(removeAt(list, i))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="field"
              placeholder="Outlet"
              value={pb.outlet}
              onChange={(e) => set(replaceAt(list, i, { outlet: e.target.value }))}
            />
            <input
              className="field"
              placeholder="Date"
              value={pb.date}
              onChange={(e) => set(replaceAt(list, i, { date: e.target.value }))}
            />
          </div>
          <input
            className="field"
            type="url"
            placeholder="URL"
            value={pb.url}
            onChange={(e) => set(replaceAt(list, i, { url: e.target.value }))}
          />
        </div>
      ))}
    </>
  );
}

function CertsForm({ content, commit }: FormProps) {
  const list = content.certs;
  const set = (next: Content["certs"]) => commit({ ...content, certs: next });
  return (
    <>
      <ListHeader
        label="Certifications"
        onAdd={() => set([...list, { id: uid(), name: "", issuer: "", year: "" }])}
      />
      {list.map((ct, i) => (
        <div key={ct.id} className="mb-3 grid gap-[9px] rounded-[11px] border border-line p-[14px]">
          <div className="flex gap-2">
            <input
              className="field font-semibold"
              placeholder="Name"
              value={ct.name}
              onChange={(e) => set(replaceAt(list, i, { name: e.target.value }))}
            />
            <RemoveButton onClick={() => set(removeAt(list, i))} />
          </div>
          <div className="grid grid-cols-[1.4fr_0.6fr] gap-2">
            <input
              className="field"
              placeholder="Issuer"
              value={ct.issuer}
              onChange={(e) => set(replaceAt(list, i, { issuer: e.target.value }))}
            />
            <input
              className="field"
              placeholder="Year"
              value={ct.year}
              onChange={(e) => set(replaceAt(list, i, { year: e.target.value }))}
            />
          </div>
          <ImageDrop
            value={ct.image}
            onChange={(image) => set(replaceAt(list, i, { image }))}
            label="badge"
            contain
          />
        </div>
      ))}
    </>
  );
}

function LifeForm({ content, commit }: FormProps) {
  const list = content.hobbies;
  const set = (next: Content["hobbies"]) => commit({ ...content, hobbies: next });
  return (
    <>
      <ListHeader label="Hobbies" onAdd={() => set([...list, { id: uid(), name: "", note: "" }])} />
      {list.map((hb, i) => (
        <div key={hb.id} className="mb-3 grid gap-[9px] rounded-[11px] border border-line p-[14px]">
          <div className="flex gap-2">
            <input
              className="field font-semibold"
              placeholder="Name"
              value={hb.name}
              onChange={(e) => set(replaceAt(list, i, { name: e.target.value }))}
            />
            <RemoveButton onClick={() => set(removeAt(list, i))} />
          </div>
          <textarea
            className="field"
            placeholder="Note"
            value={hb.note}
            onChange={(e) => set(replaceAt(list, i, { note: e.target.value }))}
          />
        </div>
      ))}
    </>
  );
}

function ContactForm({ content, commit }: FormProps) {
  const { contact } = content;
  const set = (patch: Partial<Content["contact"]>) =>
    commit({ ...content, contact: { ...contact, ...patch } });
  return (
    <div className="grid gap-3">
      <Field
        label="Closing line"
        value={contact.note}
        onChange={(v) => set({ note: v })}
        multiline
      />
      <Field
        label="Reply-to email"
        type="email"
        value={contact.email}
        onChange={(v) => set({ email: v })}
      />
      <Field
        label="GitHub URL"
        type="url"
        value={contact.github}
        onChange={(v) => set({ github: v })}
      />
      <Field
        label="LinkedIn URL"
        type="url"
        value={contact.linkedin}
        onChange={(v) => set({ linkedin: v })}
      />
      <Field label="Blog URL" type="url" value={contact.blog} onChange={(v) => set({ blog: v })} />
    </div>
  );
}

// A 16:10 drop target that replaces image-slot.js (ADR-008): pick or drop a file,
// upload it to S3 via a presigned URL, and store the returned key.
function ImageDrop({
  value,
  onChange,
  label = "screenshot",
  contain = false,
}: {
  value?: string;
  onChange: (key: string | undefined) => void;
  label?: string;
  contain?: boolean;
}) {
  const jwt = useAuth((s) => s.jwt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!jwt) {
      setError("Sign in again to upload.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file, jwt));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        upload(e.dataTransfer.files[0]);
      }}
      className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-line bg-bg3"
    >
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="grid size-full place-items-center"
      >
        {value ? (
          <img
            src={imageUrl(value)}
            alt={label}
            className={`size-full ${contain ? "object-contain" : "object-cover"}`}
          />
        ) : (
          <span className="font-mono text-xs text-fg-faint">
            {busy ? "uploading…" : `drop a ${label}`}
          </span>
        )}
      </button>
      {value && (
        <button
          type="button"
          title="Remove image"
          onClick={() => onChange(undefined)}
          className="absolute right-2 top-2 grid size-6 place-items-center rounded-md border border-line bg-bg2 text-fg-faint"
        >
          ×
        </button>
      )}
      {error && (
        <p className="absolute inset-x-0 bottom-0 m-0 bg-bg2 p-1 text-center font-mono text-[10px] text-berry">
          {error}
        </p>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </div>
  );
}
