import { useCallback, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

export interface Position {
  x: number;
  y: number;
}

/**
 * Pointer-based dragging for a fixed-position element.
 *
 * Position is component state — it resets on reload (intentionally not persisted).
 * Attach the returned `onPointerDown` to the drag handle; presses that originate
 * on a <button> are ignored so handle controls keep working. Movement is clamped
 * so the element stays within the viewport.
 */
export function useDraggable(
  ref: RefObject<HTMLElement | null>,
  initial: Position,
  disabled = false,
) {
  const [position, setPosition] = useState<Position>(initial);
  const origin = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const clamp = useCallback(
    (x: number, y: number): Position => {
      const el = ref.current;
      const w = el?.offsetWidth ?? 0;
      const h = el?.offsetHeight ?? 0;
      const maxX = Math.max(0, window.innerWidth - w);
      const maxY = Math.max(0, window.innerHeight - h);
      return {
        x: Math.min(Math.max(0, x), maxX),
        y: Math.min(Math.max(0, y), maxY),
      };
    },
    [ref],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (disabled) return; // docked on mobile — no dragging
      if ((e.target as HTMLElement).closest('button')) return; // let handle controls work
      e.preventDefault();
      origin.current = { px: e.clientX, py: e.clientY, ox: position.x, oy: position.y };

      const onMove = (ev: PointerEvent) => {
        if (!origin.current) return;
        const dx = ev.clientX - origin.current.px;
        const dy = ev.clientY - origin.current.py;
        setPosition(clamp(origin.current.ox + dx, origin.current.oy + dy));
      };
      const onUp = () => {
        origin.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [clamp, position.x, position.y, disabled],
  );

  return { position, onPointerDown };
}
