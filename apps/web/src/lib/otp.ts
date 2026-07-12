// The six-box TOTP input's behaviour, pulled out as pure functions so the
// auto-advance and backspace rules are testable without a DOM. TotpStep owns the
// refs and focus; these own the digits.

export const OTP_LENGTH = 6;

/** Apply a keystroke in box `index`: keep one digit and advance on entry. */
export function applyOtpEntry(
  digits: string[],
  index: number,
  raw: string,
): { digits: string[]; focus: number } {
  const digit = raw.replace(/\D/g, "").slice(-1);
  const next = [...digits];
  next[index] = digit;
  const focus = digit && index < OTP_LENGTH - 1 ? index + 1 : index;
  return { digits: next, focus };
}

/** Backspace: clear the current digit, or step back and clear the previous one. */
export function applyOtpBackspace(
  digits: string[],
  index: number,
): { digits: string[]; focus: number } {
  const next = [...digits];
  if (next[index]) {
    next[index] = "";
    return { digits: next, focus: index };
  }
  if (index > 0) {
    next[index - 1] = "";
    return { digits: next, focus: index - 1 };
  }
  return { digits: next, focus: index };
}
