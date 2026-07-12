// First-time (or re-)enrollment: Cognito issued a TOTP secret; the owner scans the
// QR (or types the secret) into their authenticator and confirms a code to finish.
// The QR is rendered in the browser from the client-issued secret (ADR-011), so the
// seed never leaves the device.
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { OTP_LENGTH } from "../lib/otp";
import { useAuth } from "../stores/useAuth";
import { OtpInputs } from "./OtpInputs";

// Group into 4-char blocks so it can be read and typed without losing your place.
const grouped = (secret: string) => secret.replace(/(.{4})/g, "$1 ").trim();

export function TotpSetupStep({ onBack }: { onBack: () => void }) {
  const completeMfaSetup = useAuth((s) => s.completeMfaSetup);
  const pending = useAuth((s) => s.pending);
  const secret = useAuth((s) => s.setupSecret) ?? "";
  const otpauthUri = useAuth((s) => s.setupOtpauthUri) ?? "";
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");

  useEffect(() => {
    if (!otpauthUri) return;
    QRCode.toDataURL(otpauthUri, { margin: 2, width: 176, errorCorrectionLevel: "M" })
      .then(setQr)
      .catch(() => setQr(""));
  }, [otpauthUri]);

  const copy = () => {
    void navigator.clipboard?.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <h2 className="m-0 mb-1.5 font-display text-2xl font-semibold">
        Add KyleOS to your authenticator
      </h2>
      <p className="m-0 mb-4 text-[13px] text-fg-dim">
        Scan this with your authenticator app, then enter the 6-digit code it shows.
      </p>
      {qr && (
        <img
          src={qr}
          alt="Authenticator setup QR code"
          width={176}
          height={176}
          className="mx-auto mb-4 block rounded-lg"
        />
      )}
      <details className="mb-5">
        <summary className="cursor-pointer font-mono text-xs text-fg-faint">
          Can't scan? Enter the key manually
        </summary>
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-line bg-bg px-3 py-2.5">
          <span className="font-mono text-sm tracking-wider text-fg">{grouped(secret)}</span>
          <button type="button" onClick={copy} className="flex-none font-mono text-xs text-moss">
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <a href={otpauthUri} className="mt-2 block font-mono text-xs text-moss">
          On this device? Open your authenticator ↗
        </a>
      </details>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          completeMfaSetup(code);
        }}
      >
        <OtpInputs onChange={setCode} />
        <button
          type="submit"
          disabled={pending || code.length < OTP_LENGTH}
          className="w-full rounded-[9px] bg-moss px-3 py-3 font-display text-sm font-semibold text-ink disabled:opacity-60"
        >
          Verify &amp; finish
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
