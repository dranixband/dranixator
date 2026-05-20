const cache = new Map<string, HTMLAudioElement>();

export function preloadAudio(src: string): void {
  if (cache.has(src)) return;
  const a = new Audio(src);
  a.preload = "auto";
  cache.set(src, a);
}

export function getCachedAudio(src: string): HTMLAudioElement {
  if (!cache.has(src)) {
    const a = new Audio(src);
    a.preload = "auto";
    cache.set(src, a);
  }
  const a = cache.get(src)!;
  a.onloadedmetadata = null;
  a.onended = null;
  a.currentTime = 0;
  return a;
}
