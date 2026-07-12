// The owner-access login modal, shown when #admin is open but no one is signed in
// (ADR-005). It is not a security boundary — the API's JWT authorizer is; this
// just gates the editor's UI. Shell-agnostic: it overlays desktop and mobile alike.
import { useAuth } from "../stores/useAuth";
import { CredsStep } from "./CredsStep";
import { TotpStep } from "./TotpStep";

export function LoginGate({ onClose }: { onClose: () => void }) {
  const step = useAuth((s) => s.step);
  const error = useAuth((s) => s.error);
  const cancel = useAuth((s) => s.cancel);

  return (
    <div
      onMouseDown={onClose}
      className="fixed inset-0 z-[1600] grid place-items-center"
      style={{ background: "rgba(5, 8, 14, 0.6)", backdropFilter: "blur(7px)" }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{ animation: "winIn 0.2s ease" }}
        className="w-[min(400px,92vw)] rounded-2xl border border-line bg-bg2 px-[30px] py-8 shadow-[0_40px_90px_-34px_rgba(0,0,0,0.85)]"
      >
        <div className="mb-[22px] flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-[9px] border border-moss font-mono text-xs text-moss">
            KB
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-faint">
            owner access
          </span>
        </div>
        {step === "totp" ? <TotpStep onBack={cancel} /> : <CredsStep onCancel={onClose} />}
        {error && <p className="m-0 mt-4 font-mono text-xs text-berry">{error}</p>}
      </div>
    </div>
  );
}
