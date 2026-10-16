"use client";

import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import MobilePortfolio from '@/components/mobile/MobilePortfolio';
import LeafMark from '@/components/mobile/LeafMark';
import styles from '@/components/mobile/MobilePortfolio.module.css';

const mobileQuery = '(max-width: 767px), (max-width: 1023px) and (hover: none) and (pointer: coarse)';
const DesktopExperience = dynamic(() => import('./DesktopExperience'), { ssr: false });
function subscribe(callback) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const getSnapshot = () => window.matchMedia(mobileQuery).matches;
const getServerSnapshot = () => null;

export default function DesktopPage({ githubData }) {
  const mobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (mobile === null) return <div className={styles.initialLoader} role="status"><LeafMark /><span>Opening a little world…</span></div>;
  return mobile ? <MobilePortfolio /> : <DesktopExperience githubData={githubData} />;
}
