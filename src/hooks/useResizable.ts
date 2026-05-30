import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export interface Size {
  width: number;
  height: number;
}

interface Options {
  min: Size;
  disabled?: boolean;
  persistKey?: string;
}

// Keep a size within [min, viewport - 16px margin] on both axes.
function clampToViewport(s: Size, min: Size): Size {
  const maxW = Math.max(min.width, window.innerWidth - 16);
  const maxH = Math.max(min.height, window.innerHeight - 16);
  return {
    width: Math.min(Math.max(min.width, s.width), maxW),
    height: Math.min(Math.max(min.height, s.height), maxH),
  };
}

function loadPersisted(persistKey: string | undefined, fallback: Size, min: Size): Size {
  if (!persistKey) return fallback;
  try {
    const raw = localStorage.getItem(persistKey);
    if (!raw) return fallback;
    const p = JSON.parse(raw);
    if (p && typeof p.width === 'number' && typeof p.height === 'number') {
      return clampToViewport({ width: p.width, height: p.height }, min);
    }
  } catch {
    // localStorage unavailable / malformed → fall back to default.
  }
  return fallback;
}

/**
 * Pointer-based resizing for a fixed-position element.
 *
 * Attach `onResizeStart` to a corner grip. Movement updates `size`, clamped to
 * `min` and the viewport. When `persistKey` is set, the final size is written to
 * localStorage on pointer-up and restored (re-clamped) on init. `disabled` (e.g.
 * mobile dock mode) makes `onResizeStart` a no-op.
 */
export function useResizable(initial: Size, opts: Options) {
  const { min, disabled = false, persistKey } = opts;
  const [size, setSize] = useState<Size>(() => loadPersisted(persistKey, initial, min));

  // Track the latest size so pointer-up can persist it without stale closure.
  const latest = useRef(size);

  const onResizeStart = useCallback(
    (e: ReactPointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = size.width;
      const startH = size.height;
      latest.current = size;

      const onMove = (ev: PointerEvent) => {
        const next = clampToViewport(
          { width: startW + (ev.clientX - startX), height: startH + (ev.clientY - startY) },
          min,
        );
        latest.current = next;
        setSize(next);
      };
      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (persistKey) {
          try {
            localStorage.setItem(persistKey, JSON.stringify(latest.current));
          } catch {
            // localStorage unavailable/full → keep session-only size.
          }
        }
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [disabled, min, persistKey, size],
  );

  return { size, onResizeStart };
}
