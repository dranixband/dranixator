import { useEffect } from 'react';

// Shared across all instances so nested modals form a stack: Escape only
// closes the topmost one, regardless of listener registration order.
let stack: symbol[] = [];

export function useEscapeToClose(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const id = Symbol();
    stack.push(id);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (stack[stack.length - 1] !== id) return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      stack = stack.filter((s) => s !== id);
    };
  }, [onClose, active]);
}
