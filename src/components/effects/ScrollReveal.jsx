"use client";

import { useEffect, useRef } from "react";
import { fadeInOnScroll, staggerFadeIn } from "@/lib/animations/scroll-animations";

export const ScrollReveal = ({ children, className = "", delay = 0, stagger = false }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    if (stagger) {
      const elements = ref.current.children;
      if (elements.length > 0) {
        staggerFadeIn(Array.from(elements), { delay });
      }
    } else {
      fadeInOnScroll(ref.current, { delay });
    }

    return () => {
      // Cleanup handled by GSAP
    };
  }, [delay, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

