"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 2200;

/**
 * Counts down from the current year to `target` the first time it scrolls into view.
 *
 * The digits are hidden from assistive tech and the settled year exposed instead, so screen
 * readers announce "2010" once rather than every intermediate frame.
 */
export function CountToYear({ target, className }: { target: number; className?: string }) {
  const [start] = useState(() => new Date().getFullYear());
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const skipAnimation =
          start <= target || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (skipAnimation) {
          setValue(target);
          return;
        }

        const began = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - began) / DURATION_MS, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic — settles onto the year
          setValue(Math.round(start + (target - start) * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [start, target]);

  return (
    <span ref={ref} className={className}>
      {/* The build-time year can differ from the visitor's, and the effect corrects it anyway. */}
      <span aria-hidden="true" suppressHydrationWarning>
        {value}
      </span>
      <span className="sr-only">{target}</span>
    </span>
  );
}
