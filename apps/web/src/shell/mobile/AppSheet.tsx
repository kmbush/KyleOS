// A mobile app sheet: full-screen, a back chevron that returns to the
// springboard, and the shared app content — one app open at a time.
import { AppContent } from "../../apps/AppContent";
import type { AppDef } from "../../lib/apps";

export function AppSheet({ app, onBack }: { app: AppDef; onBack: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[520] flex flex-col overflow-hidden bg-bg"
      style={{ animation: "winIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      <div className="flex flex-none items-center gap-3 border-b border-line bg-bg2 px-4 py-[14px]">
        <button
          type="button"
          title="Back"
          onClick={onBack}
          className="text-[26px] leading-none text-moss"
        >
          ‹
        </button>
        <span className="font-mono text-sm text-fg">{app.windowTitle}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-[clamp(18px,2.4vw,30px)]">
        <AppContent appId={app.id} />
      </div>
    </div>
  );
}
