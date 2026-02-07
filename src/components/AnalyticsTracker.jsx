"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

function parseUserAgent(ua) {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };

  let device = "desktop";
  if (/mobile/i.test(ua)) device = "mobile";
  else if (/tablet|ipad/i.test(ua)) device = "tablet";

  let browser = "unknown";
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge|edg/i.test(ua)) browser = "Edge";

  let os = "unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/ios|iphone|ipad/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

// Capture UTM params at module level before RefCleanup strips them
let initialUtmParams = null;

function captureUtmParams() {
  if (initialUtmParams !== null) return initialUtmParams;
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  initialUtmParams = {
    utmSource: params.get("ref") || params.get("utm_source") || null,
    utmMedium: params.get("utm_medium") || null,
    utmCampaign: params.get("utm_campaign") || null,
  };
  return initialUtmParams;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef(null);
  const utmParams = useRef(captureUtmParams());

  const trackMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Track failed: ${res.status}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (pathname === lastTrackedPath.current) return;
    lastTrackedPath.current = pathname;

    const { device, browser, os } = parseUserAgent(navigator.userAgent);

    trackMutation.mutate({
      type: "pageview",
      path: pathname,
      referrer: document.referrer || null,
      device,
      browser,
      os,
      utmSource: utmParams.current.utmSource,
      utmMedium: utmParams.current.utmMedium,
      utmCampaign: utmParams.current.utmCampaign,
    });

    // UTM params only apply to the landing page
    utmParams.current = { utmSource: null, utmMedium: null, utmCampaign: null };
  }, [pathname]);

  return null;
}
