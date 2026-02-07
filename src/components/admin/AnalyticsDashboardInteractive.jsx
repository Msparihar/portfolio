"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Eye,
  Activity,
  TrendingUp,
  RefreshCw,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  LogOut,
  FileText,
  MousePointerClick,
  Link2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Terminal-styled stat card
function StatCard({ icon: Icon, label, value, loading }) {
  return (
    <div className="border border-border/30 rounded-lg p-4 bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-green-500/10">
          <Icon className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-mono">{label}</p>
          {loading ? (
            <div className="h-6 w-16 bg-border/30 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-xl font-bold font-mono text-foreground">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Terminal-styled table
function DataTable({ title, headers, rows, loading }) {
  return (
    <div className="border border-border/30 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-black/50 border-b border-border/20">
        <span className="text-green-500 font-mono text-sm">$ {title}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-background/50">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-2 text-left text-xs font-mono text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-border/10">
                  {headers.map((_, j) => (
                    <td key={j} className="px-4 py-2">
                      <div className="h-4 w-20 bg-border/30 animate-pulse rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr className="border-t border-border/10">
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground font-mono"
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-border/10 hover:bg-green-500/5"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-2 text-sm font-mono text-foreground"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple bar chart
function BarChart({ data, loading }) {
  if (loading) {
    return <div className="h-48 bg-border/10 animate-pulse rounded" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground font-mono text-sm">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="h-48 flex items-end gap-1 px-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-green-500/60 rounded-t hover:bg-green-500/80 transition-colors min-h-[2px]"
            style={{ height: `${(d.views / maxValue) * 100}%`, transition: `height 0.3s ease ${i * 0.05}s` }}
            title={`${d.date}: ${d.views} views`}
          />
          <span className="text-[9px] text-muted-foreground font-mono truncate w-full text-center">
            {new Date(d.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

// Device icon component
function DeviceIcon({ device }) {
  switch (device?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "tablet":
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
}

// Ref link presets - short codes
const REF_PRESETS = [
  { name: "LinkedIn", ref: "ln" },
  { name: "GitHub", ref: "gh" },
  { name: "Twitter", ref: "tw" },
  { name: "Resume", ref: "cv" },
  { name: "Email", ref: "em" },
  { name: "Blog", ref: "bl" },
];

// Link Generator component
function LinkGenerator({ baseUrl = "https://manishsingh.tech" }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customRef, setCustomRef] = useState("");
  const [copied, setCopied] = useState(false);

  const getGeneratedUrl = () => {
    const ref = selectedPreset?.ref || customRef;
    if (!ref) return null;
    return `${baseUrl}/?ref=${ref}`;
  };

  const handleCopy = async () => {
    const url = getGeneratedUrl();
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePresetClick = (preset) => {
    setSelectedPreset(preset);
    setCustomRef("");
  };

  const handleCustomRefChange = (e) => {
    setCustomRef(e.target.value);
    setSelectedPreset(null);
  };

  const generatedUrl = getGeneratedUrl();

  return (
    <div className="border border-border/30 rounded-lg overflow-hidden bg-background/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 bg-black/50 border-b border-border/20 flex items-center justify-between hover:bg-black/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-green-500" />
          <span className="text-green-500 font-mono text-sm">$ generate-link</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-4">
          {/* Preset buttons */}
          <div>
            <p className="text-xs text-muted-foreground font-mono mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {REF_PRESETS.map((preset) => (
                <button
                  key={preset.ref}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono transition-colors ${
                    selectedPreset?.ref === preset.ref
                      ? "bg-green-500/20 text-green-500 border border-green-500/50"
                      : "bg-black/30 text-muted-foreground border border-border/30 hover:border-green-500/30 hover:text-green-500"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom ref input */}
          <div>
            <p className="text-xs text-muted-foreground font-mono mb-2">Or custom ref:</p>
            <input
              type="text"
              value={customRef}
              onChange={handleCustomRefChange}
              placeholder="xx"
              className="w-24 px-3 py-2 bg-black/30 border border-border/30 rounded-md text-sm font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Generated URL */}
          {generatedUrl && (
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">Generated URL:</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 bg-black/50 border border-border/30 rounded-md text-sm font-mono text-green-500 overflow-x-auto whitespace-nowrap">
                  {generatedUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-md hover:bg-green-500/20 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-green-500" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsDashboardInteractive() {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [referrerData, setReferrerData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [utmData, setUtmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [overviewRes, devicesRes, referrersRes, geoRes, utmRes] = await Promise.all([
        fetch(`/api/analytics/data?range=${range}&metric=overview`),
        fetch(`/api/analytics/data?range=${range}&metric=devices`),
        fetch(`/api/analytics/data?range=${range}&metric=referrers`),
        fetch(`/api/analytics/data?range=${range}&metric=geography`),
        fetch(`/api/analytics/data?range=${range}&metric=utm`),
      ]);

      if (!overviewRes.ok) {
        if (overviewRes.status === 401) {
          router.push("/admin/analytics/login");
          return;
        }
        throw new Error("Failed to fetch data");
      }

      const [overview, devices, referrers, geo, utm] = await Promise.all([
        overviewRes.json(),
        devicesRes.json(),
        referrersRes.json(),
        geoRes.json(),
        utmRes.json(),
      ]);

      setData(overview);
      setDeviceData(devices);
      setReferrerData(referrers);
      setGeoData(geo);
      setUtmData(utm);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const handleLogout = async () => {
    await fetch("/api/analytics/auth", { method: "DELETE" });
    router.push("/admin/analytics/login");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-foreground">
            <span className="text-green-500">$</span> analytics --dashboard
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            Server-side analytics • Ad-blocker proof
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 bg-background/50 border border-border/30 rounded-md text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 border border-border/30 rounded-md hover:bg-green-500/10 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-green-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 border border-border/30 rounded-md hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-red-500" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/10 text-red-500 font-mono text-sm">
          Error: {error}
        </div>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="Page Views"
          value={data?.summary?.pageViews?.toLocaleString() || "0"}
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Unique Visitors"
          value={data?.summary?.uniqueVisitors?.toLocaleString() || "0"}
          loading={loading}
        />
        <StatCard
          icon={Activity}
          label="Sessions"
          value={data?.summary?.sessions?.toLocaleString() || "0"}
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Pages/Session"
          value={data?.summary?.avgPagesPerSession || "0"}
          loading={loading}
        />
      </div>

      {/* Link Generator */}
      <LinkGenerator />

      {/* Traffic Sources */}
      <DataTable
        title="cat sources.log"
        headers={["Source", "Sessions", "% of Total"]}
        rows={
          utmData?.sources?.map((s) => [
            s.source,
            s.sessions.toLocaleString(),
            utmData.totalSessions > 0
              ? `${Math.round((s.sessions / utmData.totalSessions) * 100)}%`
              : "0%",
          ]) || []
        }
        loading={loading}
      />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily views chart */}
        <div className="border border-border/30 rounded-lg p-4 bg-background/50">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-muted-foreground">
              Daily Page Views
            </span>
          </div>
          <BarChart data={data?.dailyStats || []} loading={loading} />
        </div>

        {/* Top pages */}
        <DataTable
          title="cat top-pages.log"
          headers={["Page", "Views"]}
          rows={
            data?.topPages?.map((p) => [p.path, p.views.toLocaleString()]) || []
          }
          loading={loading}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic sources */}
        <DataTable
          title="cat referrers.log"
          headers={["Source", "Sessions"]}
          rows={
            referrerData?.referrers?.map((r) => [
              r.referrer,
              r.sessions.toLocaleString(),
            ]) || []
          }
          loading={loading}
        />

        {/* Geography */}
        <DataTable
          title="cat geography.log"
          headers={["Country", "Visitors"]}
          rows={
            geoData?.countries?.map((c) => [
              c.country,
              c.visitors.toLocaleString(),
            ]) || []
          }
          loading={loading}
        />
      </div>

      {/* Device stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Devices */}
        <div className="border border-border/30 rounded-lg p-4 bg-background/50">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-muted-foreground">
              Devices
            </span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-border/30 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {deviceData?.devices?.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-black/20 rounded"
                >
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <DeviceIcon device={d.device} />
                    <span className="capitalize">{d.device}</span>
                  </div>
                  <span className="text-sm font-mono text-green-500">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Browsers */}
        <div className="border border-border/30 rounded-lg p-4 bg-background/50">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-muted-foreground">
              Browsers
            </span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-border/30 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {deviceData?.browsers?.slice(0, 5).map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-black/20 rounded"
                >
                  <span className="text-sm font-mono">{b.browser}</span>
                  <span className="text-sm font-mono text-green-500">
                    {b.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operating Systems */}
        <div className="border border-border/30 rounded-lg p-4 bg-background/50">
          <div className="flex items-center gap-2 mb-4">
            <MousePointerClick className="w-4 h-4 text-green-500" />
            <span className="text-sm font-mono text-muted-foreground">
              Operating Systems
            </span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-border/30 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {deviceData?.operatingSystems?.slice(0, 5).map((o, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-black/20 rounded"
                >
                  <span className="text-sm font-mono">{o.os}</span>
                  <span className="text-sm font-mono text-green-500">
                    {o.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground font-mono pt-4 border-t border-border/20">
        <span className="text-green-500">●</span> Analytics running •{" "}
        <a
          href="/"
          className="hover:text-green-500 transition-colors inline-flex items-center gap-1"
        >
          Back to site <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
