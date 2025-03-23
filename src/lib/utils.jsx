import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const extractUniqueTags = (items) => {
  const tags = items.reduce((acc, item) => {
    item.tags?.forEach(tag => acc.add(tag));
    return acc;
  }, new Set());
  return Array.from(tags).sort();
};
