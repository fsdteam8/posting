"use client";

import { useRef, useState } from "react";

const LONG_PRESS_MS = 450;
const SWIPE_THRESHOLD_PX = 60;
const SWIPE_CLAMP_PX = 90;
const MOVE_CANCEL_PX = 6;

interface Params {
  onLongPress: () => void;
  onSwipeReply: () => void;
}

/**
 * Touch gestures for chat bubbles:
 *  - Long press (~450ms without movement) → opens the reaction picker.
 *  - Horizontal swipe past the threshold → triggers reply.
 * Returns the props to spread on the bubble wrapper plus the current
 * `translateX` so the caller can apply visual feedback.
 */
export function useMessageGestures({ onLongPress, onSwipeReply }: Params) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);
  const [translateX, setTranslateX] = useState(0);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    startRef.current = { x: t.clientX, y: t.clientY };
    movedRef.current = false;
    setTranslateX(0);
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (!movedRef.current) {
        // Vibrate if supported — a nice tactile hint that the long press fired.
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate?.(15);
          } catch {
            /* noop */
          }
        }
        onLongPress();
      }
      timerRef.current = null;
    }, LONG_PRESS_MS);
  }

  function onTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    const s = startRef.current;
    if (!t || !s) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;

    if (
      !movedRef.current &&
      (Math.abs(dx) > MOVE_CANCEL_PX || Math.abs(dy) > MOVE_CANCEL_PX)
    ) {
      movedRef.current = true;
      clearTimer();
    }

    // Only track horizontal swipe gesture
    if (Math.abs(dx) > Math.abs(dy)) {
      const clamped = Math.max(-SWIPE_CLAMP_PX, Math.min(SWIPE_CLAMP_PX, dx));
      setTranslateX(clamped);
    }
  }

  function onTouchEnd() {
    clearTimer();
    const tx = translateX;
    setTranslateX(0);
    startRef.current = null;
    if (Math.abs(tx) >= SWIPE_THRESHOLD_PX) {
      onSwipeReply();
    }
  }

  function onTouchCancel() {
    clearTimer();
    setTranslateX(0);
    startRef.current = null;
  }

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel },
    translateX,
  };
}
