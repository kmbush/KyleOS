// Phase 0 placeholder. The desktop and mobile shells replace this in Phase 1;
// for now it proves the theme tokens and self-hosted fonts render.

export function App() {
  return (
    <main className="grid h-screen place-items-center">
      <div className="grid place-items-center gap-5">
        <div className="grid size-16 place-items-center rounded-2xl bg-moss font-mono text-[30px] font-bold text-ink">
          K
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-fg-dim">booting KyleOS</p>
      </div>
    </main>
  );
}
