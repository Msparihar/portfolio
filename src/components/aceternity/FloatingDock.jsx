"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className }) => {
  return (
    <div className={cn("relative block md:hidden", className)}>
      <div className="flex items-center justify-center gap-4">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1"
          >
            <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center">
              <item.icon className="h-5 w-5 text-neutral-400" />
            </div>
            <span className="text-xs text-neutral-400">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl bg-gray-900/80 backdrop-blur-sm px-4 pb-3 border border-gray-800",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon: Icon, href }) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{ width }}
        className="aspect-square rounded-full bg-gray-800 flex items-center justify-center relative group"
      >
        <Icon className="h-5 w-5 text-neutral-400 group-hover:text-green-400 transition-colors" />
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black px-2 py-1 rounded text-xs whitespace-nowrap text-white">
          {title}
        </div>
      </motion.div>
    </Link>
  );
}

