"use client";

import { useEffect, useState } from "react";

/** Soft Ember / Plasma glow that follows the pointer on the Pumice canvas. */
export function PointerGlow() {
  const [pos, setPos] = useState({ x: 50, y: 40 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
      setVisible(true);
    }

    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0.55,
          background: `
            radial-gradient(
              720px circle at ${pos.x}% ${pos.y}%,
              color-mix(in srgb, var(--ember) 28%, transparent) 0%,
              color-mix(in srgb, var(--plasma) 14%, transparent) 28%,
              transparent 58%
            ),
            radial-gradient(
              520px circle at ${100 - pos.x * 0.35}% ${100 - pos.y * 0.4}%,
              color-mix(in srgb, var(--sulfur) 18%, transparent) 0%,
              transparent 50%
            )
          `,
        }}
      />
    </div>
  );
}
