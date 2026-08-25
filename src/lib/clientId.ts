// Stable per-browser id used for cross-session features (reactions, etc.).
// Generated lazily on first read and persisted in localStorage. If storage
// is unavailable (private mode), falls back to an in-memory value that lives
// for the lifetime of the page.
const KEY = "dranix_client_id";

let cached: string | null = null;

function generate(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getClientId(): string {
  if (cached) return cached;
  try {
    const existing = localStorage.getItem(KEY);
    if (existing && existing.length > 0) {
      cached = existing;
      return cached;
    }
    const fresh = generate();
    localStorage.setItem(KEY, fresh);
    cached = fresh;
    return fresh;
  } catch {
    cached = generate();
    return cached;
  }
}
