"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const ParallaxLayer = ({
  children,
  speed = 0.5,
  className = "",
  direction = "vertical",
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const animation = gsap.to(element, {
      y: direction === "vertical" ? (i, target) => {
        return -ScrollTrigger.maxScroll(window) * speed;
      } : 0,
      x: direction === "horizontal" ? (i, target) => {
        return -ScrollTrigger.maxScroll(window) * speed;
      } : 0,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [speed, direction]);

  return (
    <div ref={ref} className={cn("parallax-layer", className)}>
      {children}
    </div>
  );
};

