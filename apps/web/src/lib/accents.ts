// Accent cycling: repeated items (project cards, cert cards, fact chips) cycle
// these four by array index mod 4 (DESIGN §7); Writing keys by outlet so a source
// keeps one colour. This is the one implementation — never reinline it.
const ACCENTS = ["var(--moss)", "var(--glacier)", "var(--berry)", "var(--amber)"] as const;

export function accentAt(index: number): string {
  // `as const` makes ACCENTS[0] a known-present literal, so the fallback keeps
  // the return type a plain string without a non-null assertion.
  return ACCENTS[index % ACCENTS.length] ?? ACCENTS[0];
}
