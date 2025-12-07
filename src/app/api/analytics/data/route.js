import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Check authentication
async function isAuthenticated() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("analytics_auth");
  const expectedPassword = process.env.ANALYTICS_PASSWORD;

  if (!expectedPassword) return false;
  return authCookie?.value === expectedPassword;
}

export async function GET(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";
  const metric = searchParams.get("metric") || "overview";

  const startDate = getStartDate(range);

  try {
    switch (metric) {
      case "overview":
        return NextResponse.json(await getOverviewStats(startDate));
      case "pages":
        return NextResponse.json(await getPageStats(startDate));
      case "referrers":
        return NextResponse.json(await getReferrerStats(startDate));
      case "geography":
        return NextResponse.json(await getGeographyStats(startDate));
      case "devices":
        return NextResponse.json(await getDeviceStats(startDate));
      case "events":
        return NextResponse.json(await getEventStats(startDate));
      case "utm":
        return NextResponse.json(await getUtmStats(startDate));
      default:
        return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
    }
  } catch (error) {
    console.error("Analytics data error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

function getStartDate(range) {
  const now = new Date();
  switch (range) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(0);
  }
}

async function getOverviewStats(startDate) {
  const [pageViews, uniqueVisitors, sessions, topPages, recentPageViews] =
    await Promise.all([
      prisma.pageView.count({
        where: { viewedAt: { gte: startDate } },
      }),
      prisma.visitor.count({
        where: { firstSeenAt: { gte: startDate } },
      }),
      prisma.session.count({
        where: { startedAt: { gte: startDate } },
      }),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { viewedAt: { gte: startDate } },
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.pageView.findMany({
        where: { viewedAt: { gte: startDate } },
        select: { viewedAt: true },
        orderBy: { viewedAt: "asc" },
      }),
    ]);

  // Group by date for daily chart
  const dailyStats = {};
  recentPageViews.forEach((pv) => {
    const date = pv.viewedAt.toISOString().split("T")[0];
    dailyStats[date] = (dailyStats[date] || 0) + 1;
  });

  const dailyChartData = Object.entries(dailyStats).map(([date, views]) => ({
    date,
    views,
  }));

  return {
    summary: {
      pageViews,
      uniqueVisitors,
      sessions,
      avgPagesPerSession: sessions > 0 ? (pageViews / sessions).toFixed(1) : 0,
    },
    topPages: topPages.map((p) => ({
      path: p.path,
      views: p._count.path,
    })),
    dailyStats: dailyChartData,
  };
}

async function getPageStats(startDate) {
  const pages = await prisma.pageView.groupBy({
    by: ["path"],
    where: { viewedAt: { gte: startDate } },
    _count: { path: true },
    _avg: { duration: true, scrollDepth: true },
    orderBy: { _count: { path: "desc" } },
    take: 50,
  });

  return {
    pages: pages.map((p) => ({
      path: p.path,
      views: p._count.path,
      avgDuration: Math.round(p._avg.duration || 0),
      avgScrollDepth: Math.round(p._avg.scrollDepth || 0),
    })),
  };
}

async function getReferrerStats(startDate) {
  const referrers = await prisma.session.groupBy({
    by: ["referrer"],
    where: {
      startedAt: { gte: startDate },
      referrer: { not: null },
    },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: 20,
  });

  // Parse referrer domains
  const referrerData = referrers.map((r) => {
    let domain = "Direct";
    if (r.referrer) {
      try {
        domain = new URL(r.referrer).hostname;
      } catch {
        domain = r.referrer;
      }
    }
    return {
      referrer: domain,
      sessions: r._count.referrer,
    };
  });

  // Count direct traffic
  const directCount = await prisma.session.count({
    where: {
      startedAt: { gte: startDate },
      referrer: null,
    },
  });

  if (directCount > 0) {
    referrerData.unshift({ referrer: "Direct", sessions: directCount });
  }

  return { referrers: referrerData };
}

async function getGeographyStats(startDate) {
  const countries = await prisma.visitor.groupBy({
    by: ["country"],
    where: {
      firstSeenAt: { gte: startDate },
      country: { not: null },
    },
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
    take: 20,
  });

  return {
    countries: countries.map((c) => ({
      country: c.country || "Unknown",
      visitors: c._count.country,
    })),
  };
}

async function getDeviceStats(startDate) {
  const [devices, browsers, os] = await Promise.all([
    prisma.visitor.groupBy({
      by: ["device"],
      where: { firstSeenAt: { gte: startDate } },
      _count: { device: true },
    }),
    prisma.visitor.groupBy({
      by: ["browser"],
      where: { firstSeenAt: { gte: startDate } },
      _count: { browser: true },
      orderBy: { _count: { browser: "desc" } },
      take: 10,
    }),
    prisma.visitor.groupBy({
      by: ["os"],
      where: { firstSeenAt: { gte: startDate } },
      _count: { os: true },
      orderBy: { _count: { os: "desc" } },
      take: 10,
    }),
  ]);

  return {
    devices: devices.map((d) => ({
      device: d.device || "Unknown",
      count: d._count.device,
    })),
    browsers: browsers.map((b) => ({
      browser: b.browser || "Unknown",
      count: b._count.browser,
    })),
    operatingSystems: os.map((o) => ({
      os: o.os || "Unknown",
      count: o._count.os,
    })),
  };
}

async function getEventStats(startDate) {
  const events = await prisma.event.groupBy({
    by: ["name"],
    where: { createdAt: { gte: startDate } },
    _count: { name: true },
    orderBy: { _count: { name: "desc" } },
    take: 20,
  });

  return {
    events: events.map((e) => ({
      name: e.name,
      count: e._count.name,
    })),
  };
}

async function getUtmStats(startDate) {
  // Get sessions with UTM data
  const [sources, mediums, campaigns, totalSessions] = await Promise.all([
    prisma.session.groupBy({
      by: ["utmSource"],
      where: {
        startedAt: { gte: startDate },
        utmSource: { not: null },
      },
      _count: { utmSource: true },
      orderBy: { _count: { utmSource: "desc" } },
      take: 20,
    }),
    prisma.session.groupBy({
      by: ["utmMedium"],
      where: {
        startedAt: { gte: startDate },
        utmMedium: { not: null },
      },
      _count: { utmMedium: true },
      orderBy: { _count: { utmMedium: "desc" } },
      take: 20,
    }),
    prisma.session.groupBy({
      by: ["utmCampaign"],
      where: {
        startedAt: { gte: startDate },
        utmCampaign: { not: null },
      },
      _count: { utmCampaign: true },
      orderBy: { _count: { utmCampaign: "desc" } },
      take: 20,
    }),
    prisma.session.count({
      where: { startedAt: { gte: startDate } },
    }),
  ]);

  // Calculate direct traffic (no UTM source)
  const utmTraffic = sources.reduce((sum, s) => sum + s._count.utmSource, 0);
  const directTraffic = totalSessions - utmTraffic;

  return {
    sources: [
      ...(directTraffic > 0 ? [{ source: "direct", sessions: directTraffic }] : []),
      ...sources.map((s) => ({
        source: s.utmSource,
        sessions: s._count.utmSource,
      })),
    ],
    mediums: mediums.map((m) => ({
      medium: m.utmMedium,
      sessions: m._count.utmMedium,
    })),
    campaigns: campaigns.map((c) => ({
      campaign: c.utmCampaign,
      sessions: c._count.utmCampaign,
    })),
    totalSessions,
  };
}
