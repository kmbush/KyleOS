// Step two of owner sign-in: six auto-advancing single-character boxes. Cognito
// validates the code (ADR-003) — here we only collect it. The auto-advance and
// backspace rules live in lib/otp so they can be tested without a DOM.
import { useEffect, useRef, useState } from "react";
import { applyOtpBackspace, applyOtpEntry, OTP_LENGTH } from "../lib/otp";
import { useAuth } from "../stores/useAuth";

// Stable per-position keys — the boxes never reorder, so these carry no index.
const BOXES = ["d1", "d2", "d3", "d4", "d5", "d6"];

export function TotpStep({ onBack }: { onBack: () => void }) {
  const submitTotp = useAuth((s) => s.submitTotp);
  const pending = useAuth((s) => s.pending);
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => boxes.current[0]?.focus(), []);

  const focus = (index: number) => boxes.current[index]?.focus();

  const code = digits.join("");

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
        <div className="mb-[18px] flex gap-2">
          {BOXES.map((boxKey, index) => (
            <input
              key={boxKey}
              ref={(el) => {
                boxes.current[index] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              autoComplete="off"
              value={digits[index] ?? ""}
              onChange={(e) => {
                const next = applyOtpEntry(digits, index, e.target.value);
                setDigits(next.digits);
                focus(next.focus);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Backspace") return;
                e.preventDefault();
                const next = applyOtpBackspace(digits, index);
                setDigits(next.digits);
                focus(next.focus);
              }}
              className="field text-center font-mono text-xl"
            />
          ))}
        </div>
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
