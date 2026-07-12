// The Spotlight / shortcut modifier label: ⌘ on Apple platforms, Ctrl elsewhere.
const ua = typeof navigator !== "undefined" ? `${navigator.platform} ${navigator.userAgent}` : "";

export const MOD_KEY = /Mac|iPhone|iPad|iPod/.test(ua) ? "⌘" : "Ctrl";
