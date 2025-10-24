"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }) => {
  const beams = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    initialX: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    width: Math.random() * 150 + 50,
  }));

  return (
    <div className={cn(
      "absolute inset-0 overflow-hidden pointer-events-none",
      className
    )}>
      {/* Gradient overlays for atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10" />

      {/* Beam elements */}
      <div className="absolute inset-0 overflow-hidden">
        {beams.map((beam) => (
          <motion.div
            key={beam.id}
            initial={{
              x: `${beam.initialX}%`,
              y: "-100%",
              opacity: 0,
            }}
            animate={{
              y: "200%",
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: beam.duration,
              repeat: Infinity,
              delay: beam.delay,
              ease: "linear",
            }}
            className="absolute top-0 left-0"
            style={{
              width: `${beam.width}px`,
            }}
          >
            <div
              className="h-screen w-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent"
              style={{
                boxShadow: "0 0 40px 10px rgba(34, 197, 94, 0.1)",
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Additional glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-3xl pointer-events-none z-0" />
    </div>
  );
};

