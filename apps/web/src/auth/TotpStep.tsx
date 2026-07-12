// Step two of owner sign-in when TOTP is already enrolled: six code boxes. Cognito
// validates the code (ADR-003) — here we only collect it.
import { useState } from "react";
import { OTP_LENGTH } from "../lib/otp";
import { useAuth } from "../stores/useAuth";
import { OtpInputs } from "./OtpInputs";

export function TotpStep({ onBack }: { onBack: () => void }) {
  const submitTotp = useAuth((s) => s.submitTotp);
  const pending = useAuth((s) => s.pending);
  const [code, setCode] = useState("");

  return (
    <>
      <h2 className="m-0 mb-1.5 font-display text-2xl font-semibold">Two-factor</h2>
      <p className="m-0 mb-5 text-[13px] text-fg-dim">
        Enter the 6-digit code from your authenticator.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitTotp(code);
        }}
      >
        <OtpInputs onChange={setCode} />
        <button
          type="submit"
          disabled={pending || code.length < OTP_LENGTH}
          className="w-full rounded-[9px] bg-moss px-3 py-3 font-display text-sm font-semibold text-ink disabled:opacity-60"
        >
          Verify &amp; enter
        </button>
        <button
          type="button"
          onClick={onBack}
          className="mt-2.5 w-full bg-transparent font-mono text-xs text-fg-faint"
        >
          back
        </button>
      </form>
    </>
  );
}
