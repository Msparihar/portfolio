"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export const NumberCounter = ({
  value,
  duration = 2,
  className = "",
  prefix = "",
  suffix = "",
  decimals = 0,
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const motionValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const rounded = useTransform(motionValue, (latest) => {
    return latest.toFixed(decimals);
  });

  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => unsubscribe();
  }, [rounded]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

// Alternative GSAP-based counter
export const GSAPNumberCounter = ({
  value,
  duration = 2,
  className = "",
  prefix = "",
  suffix = "",
}) => {
  const ref = useRef(null);
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!ref.current || !inView) return;

    const element = ref.current;
    const obj = { value: 0 };

    const animation = gsap.to(obj, {
      value: value,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        element.textContent = `${prefix}${Math.round(obj.value)}${suffix}`;
      },
    });

    return () => {
      animation.kill();
    };
  }, [inView, value, duration, prefix, suffix]);

  return (
    <span
      ref={(node) => {
        ref.current = node;
        inViewRef(node);
      }}
      className={cn("inline-block tabular-nums", className)}
    >
      {prefix}0{suffix}
    </span>
  );
};

