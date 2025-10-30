// src/components/HScrollButtons.js
import React, { useRef } from "react";

/**
 * Wrap your horizontally-scrollable row with chevrons.
 * Children should be product cards (.hp-card).
 */
export default function HScrollButtons({ children, step = 320 }) {
  const ref = useRef(null);
  const scrollBy = (dx) => ref.current?.scrollBy({ left: dx, behavior: "smooth" });

  return (
    <div className="hscroll-wrapper">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scrollBy(-step)}
        className="hscroll-btn hscroll-btn--left"
      >
        ‹
      </button>

      <div ref={ref} className="hp-strip">
        {children}
      </div>

      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scrollBy(step)}
        className="hscroll-btn hscroll-btn--right"
      >
        ›
      </button>
    </div>
  );
}
