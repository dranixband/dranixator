import { useEffect, useState } from 'react';

export interface VisualViewportState {
  /** Height of the area actually visible to the user (excludes the on-screen keyboard). */
  height: number;
  /** Vertical offset of the visual viewport from the layout viewport top. */
  offsetTop: number;
}

function read(): VisualViewportState {
  const vv = window.visualViewport;
  if (!vv) return { height: window.innerHeight, offsetTop: 0 };
  return { height: vv.height, offsetTop: vv.offsetTop };
}

/**
 * Tracks `window.visualViewport` so fixed overlays can stay inside the region the
 * user can actually see. On mobile the on-screen keyboard shrinks/offsets the
 * visual viewport without changing the layout viewport — `position:fixed` elements
 * anchored to `top:0` would otherwise slide out of view. Read `height`/`offsetTop`
 * to re-anchor the element above the keyboard.
 *
 * Falls back to `window.innerHeight`/0 when the API is unavailable (older browsers).
 */
export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(() => read());

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setState(read());
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return state;
}
