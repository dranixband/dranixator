import { useState, useRef } from "react";

export function useCarousel(
  count: number,
  index: number,
  onIndex: React.Dispatch<React.SetStateAction<number | null>>,
) {
  const startXRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [animating, setAnimating] = useState(false);
  // Keep dragX accessible in closures without stale state
  const dragXRef = useRef(0);

  function navigate(direction: 1 | -1) {
    if (count <= 1 || animatingRef.current) return;
    const snapTo = direction * -window.innerWidth;
    animatingRef.current = true;
    setAnimating(true);
    dragXRef.current = snapTo;
    setDragX(snapTo);
    setTimeout(() => {
      onIndex((i) => ((i ?? 0) + direction + count) % count);
      dragXRef.current = 0;
      setDragX(0);
      animatingRef.current = false;
      setAnimating(false);
    }, 280);
  }

  const touchHandlers = {
    onTouchStart(e: React.TouchEvent) {
      if (animatingRef.current) return;
      startXRef.current = e.touches[0].clientX;
    },
    onTouchMove(e: React.TouchEvent) {
      if (startXRef.current === null) return;
      const dx = e.touches[0].clientX - startXRef.current;
      dragXRef.current = dx;
      setDragX(dx);
    },
    onTouchEnd() {
      if (startXRef.current === null) return;
      const threshold = window.innerWidth * 0.25;
      const dx = dragXRef.current;
      if (dx < -threshold) {
        navigate(1);
      } else if (dx > threshold) {
        navigate(-1);
      } else {
        animatingRef.current = true;
        setAnimating(true);
        dragXRef.current = 0;
        setDragX(0);
        setTimeout(() => {
          animatingRef.current = false;
          setAnimating(false);
        }, 280);
      }
      startXRef.current = null;
    },
  };

  const prevIdx = (index - 1 + count) % count;
  const nextIdx = (index + 1) % count;

  const stripStyle: React.CSSProperties = {
    display: "flex",
    width: "300%",
    transform: `translateX(calc(-33.333% + ${dragX}px))`,
    transition: animating ? "transform 0.28s cubic-bezier(0.25,0.46,0.45,0.94)" : "none",
    willChange: "transform",
  };

  return { touchHandlers, stripStyle, prevIdx, nextIdx, navigate };
}
