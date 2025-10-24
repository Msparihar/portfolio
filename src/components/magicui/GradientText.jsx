"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const GradientText = ({
  children,
  className,
  colors = ["#22c55e", "#3b82f6", "#a855f7"],
  animationSpeed = 3,
  showBorder = false,
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    backgroundSize: "200% 200%",
  };

  return (
    <motion.span
      className={cn(
        "inline-block bg-clip-text text-transparent font-bold",
        showBorder && "pb-1 border-b-4 border-gradient",
        className
      )}
      style={gradientStyle}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: animationSpeed,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {children}
    </motion.span>
  );
};

