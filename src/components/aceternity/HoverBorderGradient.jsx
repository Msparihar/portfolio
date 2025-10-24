"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const HoverBorderGradient = ({
  children,
  className,
  containerClassName,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}) => {
  return (
    <Tag
      className={cn(
        "relative inline-flex overflow-hidden rounded-lg p-[1px] focus:outline-none",
        containerClassName
      )}
      {...props}
    >
      <motion.span
        className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#22c55e_0%,#3b82f6_50%,#a855f7_100%)]"
        style={{
          animationDirection: clockwise ? "normal" : "reverse",
          animationDuration: `${duration}s`,
        }}
      />
      <span
        className={cn(
          "relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-gray-900 px-7 py-3 text-sm font-medium text-white backdrop-blur-3xl transition-all hover:bg-gray-800",
          className
        )}
      >
        {children}
      </span>
    </Tag>
  );
};

