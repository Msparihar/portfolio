import { NextResponse } from "next/server";

// Routes to exclude from tracking
const EXCLUDED_PATHS = [
  "/api/",
  "/_next/",
  "/favicon",
  "/icons/",
  "/images/",
  "/static/",
  "/robots.txt",
  "/sitemap",
  "/manifest.json",
  "/ingest/",
  "/admin/",
];

// Parse User-Agent for device/browser info
function parseUserAgent(ua) {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };

  // Device detection
  let device = "desktop";
  if (/mobile/i.test(ua)) device = "mobile";
  else if (/tablet|ipad/i.test(ua)) device = "tablet";

  // Browser detection
  let browser = "unknown";
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edge|edg/i.test(ua)) browser = "Edge";

  // OS detection
  let os = "unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/ios|iphone|ipad/i.test(ua)) os = "iOS";

  return { device, browser, os };
}

// Generate fingerprint from request headers
function generateFingerprint(request) {
  const ua = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const lang = request.headers.get("accept-language") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  // Simple hash function
  const str = `${ua}|${accept}|${lang}|${ip}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Get country from request headers (works with Vercel, Cloudflare, etc.)
function getGeoData(request) {
  return {
    country: request.headers.get("x-vercel-ip-country") ||
             request.headers.get("cf-ipcountry") ||
             null,
    city: request.headers.get("x-vercel-ip-city") ||
          request.headers.get("cf-ipcity") ||
          null,
    region: request.headers.get("x-vercel-ip-country-region") || null,
  };
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip excluded paths
  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip non-page requests (files with extensions)
  if (pathname.includes(".") && !pathname.endsWith("/")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Get tracking data
  const ua = request.headers.get("user-agent") || "";
  const { device, browser, os } = parseUserAgent(ua);
  const fingerprint = generateFingerprint(request);
  const geo = getGeoData(request);

  // Get referrer and UTM params
  const referrer = request.headers.get("referer") || null;
  const ref = request.nextUrl.searchParams.get("ref"); // Short ref param
  const utmSource = ref || request.nextUrl.searchParams.get("utm_source");
  const utmMedium = request.nextUrl.searchParams.get("utm_medium");
  const utmCampaign = request.nextUrl.searchParams.get("utm_campaign");

  // Build tracking data
  const trackingData = {
    type: "pageview",
    fingerprint,
    path: pathname,
    referrer,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    device,
    browser,
    os,
    utmSource,
    utmMedium,
    utmCampaign,
  };

  // Fire tracking request and log failures
  const baseUrl = request.nextUrl.origin;

  try {
    const trackRes = await fetch(`${baseUrl}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(trackingData),
    });

    if (!trackRes.ok) {
      const errBody = await trackRes.text().catch(() => "");
      console.error(`[Analytics] Track failed (${trackRes.status}): ${errBody}`);
    }
  } catch (err) {
    console.error(`[Analytics] Track request failed: ${err.message} | baseUrl: ${baseUrl}`);
  }

  // Set fingerprint cookie for client-side consistency
  response.cookies.set("_afp", fingerprint, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60, // 1 year
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
