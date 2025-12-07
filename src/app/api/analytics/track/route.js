import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVisitorAlert } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      type, // 'pageview' | 'event'
      fingerprint,
      path,
      title,
      referrer,
      eventName,
      eventCategory,
      eventProperties,
      duration,
      scrollDepth,
      country,
      city,
      region,
      device,
      browser,
      os,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Validate fingerprint
    if (!fingerprint) {
      return NextResponse.json({ error: "Missing fingerprint" }, { status: 400 });
    }

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
      if (utmSource === "ln" && session.entryPage === path) {
        sendVisitorAlert("LinkedIn", { device, browser, country, path }).catch(() => {});
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
