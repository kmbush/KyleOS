// The six auto-advancing single-character code boxes, shared by the TOTP sign-in
// and enrollment steps. It owns the digit state and focus; the pure entry/backspace
// rules live in lib/otp. Reports the joined code up via onChange.
import { useEffect, useRef, useState } from "react";
import { applyOtpBackspace, applyOtpEntry, OTP_LENGTH } from "../lib/otp";

// Stable per-position keys — the boxes never reorder, so these carry no index.
const BOXES = ["d1", "d2", "d3", "d4", "d5", "d6"];

export function OtpInputs({ onChange }: { onChange: (code: string) => void }) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => boxes.current[0]?.focus(), []);

  const apply = (next: { digits: string[]; focus: number }) => {
    setDigits(next.digits);
    onChange(next.digits.join(""));
    boxes.current[next.focus]?.focus();
  };

  return (
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
          onChange={(e) => apply(applyOtpEntry(digits, index, e.target.value))}
          onKeyDown={(e) => {
            if (e.key !== "Backspace") return;
            e.preventDefault();
            apply(applyOtpBackspace(digits, index));
          }}
          className="field text-center font-mono text-xl"
        />
      ))}
    </div>
  );
}
