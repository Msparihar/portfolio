"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Terminal, AlertCircle } from "lucide-react";

export default function AnalyticsLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/analytics/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin/analytics");
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Terminal-themed background */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      <div className="w-full max-w-md mx-4">
        <div className="border border-border/30 rounded-lg overflow-hidden bg-background/80 backdrop-blur-sm">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-black/50 border-b border-border/20">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              analytics-auth
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-md bg-green-500/10">
                <Terminal className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-mono text-foreground">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground font-mono">
                  Authentication required
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-muted-foreground mb-2">
                  <span className="text-green-500">$</span> enter password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-black/30 border border-border/30 rounded-md text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500 font-mono">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-md text-green-500 font-mono transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-pulse">Authenticating</span>
                    <span className="animate-bounce">...</span>
                  </span>
                ) : (
                  "Access Dashboard"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
