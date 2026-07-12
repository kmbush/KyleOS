// Step one of owner sign-in: email and password, handed to Cognito via useAuth.
// SRP means the password is never transmitted (ADR-003).
import { useState } from "react";
import { useAuth } from "../stores/useAuth";

export function CredsStep({ onCancel }: { onCancel: () => void }) {
  const submitCreds = useAuth((s) => s.submitCreds);
  const pending = useAuth((s) => s.pending);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <h2 className="m-0 mb-1.5 font-display text-2xl font-semibold">Sign in to edit</h2>
      <p className="m-0 mb-[22px] text-[13px] text-fg-dim">You'll confirm with two-factor next.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitCreds(email, password);
        }}
        className="grid gap-3"
      >
        <input
          type="email"
          required
          autoComplete="off"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
        />
        <input
          type="password"
          required
          autoComplete="off"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field"
        />
        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-[9px] bg-moss px-3 py-3 font-display text-sm font-semibold text-ink disabled:opacity-60"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-transparent font-mono text-xs text-fg-faint"
        >
          cancel
        </button>
      </form>
    </>
  );
}
