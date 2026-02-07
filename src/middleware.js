import { NextResponse } from "next/server";

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

// Generate fingerprint from request headers (includes IP, not available client-side)
function generateFingerprint(request) {
  const ua = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const lang = request.headers.get("accept-language") || "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown";

  const str = `${ua}|${accept}|${lang}|${ip}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.includes(".") && !pathname.endsWith("/")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const fingerprint = generateFingerprint(request);
  response.cookies.set("_afp", fingerprint, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
