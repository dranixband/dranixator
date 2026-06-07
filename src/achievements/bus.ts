import type { AchEvent } from './types';

type Listener = (e: AchEvent) => void;

let listener: Listener | null = null;
let queue: AchEvent[] = [];

export function track(e: AchEvent): void {
  if (listener) listener(e);
  else queue.push(e);
}

export function subscribe(fn: Listener): () => void {
  listener = fn;
  if (queue.length) {
    const flush = queue;
    queue = [];
    for (const e of flush) fn(e);
  }
  return () => {
    if (listener === fn) listener = null;
  };
}

/** Test-only: clears listener + buffer between tests. */
export function __resetBusForTests(): void {
  listener = null;
  queue = [];
}
