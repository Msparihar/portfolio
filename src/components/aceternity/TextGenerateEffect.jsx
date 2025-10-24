"use client";

import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}) => {
  const controls = useAnimation();
  const wordsArray = words.split(" ");

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      filter: filter ? "blur(10px)" : "none",
      y: 20,
    },
    visible: {
      opacity: 1,
      filter: filter ? "blur(0px)" : "none",
      y: 0,
      transition: {
        duration: duration,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className={cn("", className)}
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          variants={wordVariants}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

