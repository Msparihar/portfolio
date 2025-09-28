"use client";

import { usePreloadPages } from '@/components/PreloadLink';

export const ClientWrapper = ({ children }) => {
  // Enable preloading for all navigation links
  usePreloadPages();

  return <>{children}</>;
};