import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVisitorAlert } from "@/lib/email";

// Extract geo data from request headers (Cloudflare/Vercel)
function getGeoData(request) {
  return {
    country: request.headers.get("x-vercel-ip-country") ||
             request.headers.get("cf-ipcountry") || null,
    city: request.headers.get("x-vercel-ip-city") ||
          request.headers.get("cf-ipcity") || null,
    region: request.headers.get("x-vercel-ip-country-region") || null,
  };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      type, // 'pageview' | 'event'
      fingerprint: bodyFingerprint,
      path,
      title,
      referrer,
      eventName,
      eventCategory,
      eventProperties,
      duration,
      scrollDepth,
      device,
      browser,
      os,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Read fingerprint: prefer body (backward compat), fall back to _afp cookie
    const fingerprint = bodyFingerprint ||
      request.cookies.get("_afp")?.value;

    if (!fingerprint) {
      return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
    }

    // Extract geo from request headers (server-side only)
    const geo = getGeoData(request);
    const country = geo.country || body.country || null;
    const city = geo.city || body.city || null;
    const region = geo.region || body.region || null;

    // Upsert visitor
    const visitor = await prisma.visitor.upsert({
      where: { fingerprint },
      update: {
        lastSeenAt: new Date(),
        country: country || undefined,
        city: city || undefined,
        region: region || undefined,
        device: device || undefined,
        browser: browser || undefined,
        os: os || undefined,
      },
      create: {
        fingerprint,
        country,
        city,
        region,
        device,
        browser,
        os,
      },
    });

    // Get or create active session (within last 30 minutes)
    const session = await getOrCreateSession(visitor.id, {
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      path,
    });

    // Handle different tracking types
    if (type === "pageview") {
      await prisma.pageView.create({
        data: {
          visitorId: visitor.id,
          sessionId: session.id,
          path: path || "/",
          title,
          duration,
          scrollDepth,
        },
      });

      // Update session exit page
      await prisma.session.update({
        where: { id: session.id },
        data: { exitPage: path },
      });

      // Send email alert for LinkedIn visitors (only on first pageview of session)
      console.log("[Track] Checking referral source:", { utmSource, entryPage: session.entryPage, path });
      if (utmSource === "ln" && session.entryPage === path) {
        console.log("[Track] LinkedIn visitor detected! Sending email alert...");
        sendVisitorAlert("LinkedIn", { device, browser, country, path }).catch((err) => {
          console.error("[Track] Failed to send email alert:", err);
        });
      }
    } else if (type === "event") {
      await prisma.event.create({
        data: {
          visitorId: visitor.id,
          sessionId: session.id,
          name: eventName || "unknown",
          category: eventCategory,
          properties: eventProperties,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function getOrCreateSession(visitorId, data) {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Find active session
  let session = await prisma.session.findFirst({
    where: {
      visitorId,
      startedAt: { gte: thirtyMinutesAgo },
      endedAt: null,
    },
    orderBy: { startedAt: "desc" },
  });

  if (!session) {
    session = await prisma.session.create({
      data: {
        visitorId,
        referrer: data.referrer,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
        entryPage: data.path,
      },
    });
  }

  return session;
}
