"use client";

import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-lg overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-grid-small-white/[0.1] bg-black/95" />

          {/* Content */}
          <div className="relative z-10 p-6">
            <h2 className="text-xl font-bold mb-4 text-red-500/80">
              <span className="text-sm mr-2">$</span>
              error: Something went wrong!
            </h2>

            <div className="mb-6 text-muted-foreground">
              <p>{error.message || "An unexpected error occurred."}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={reset}
                className="text-green-500/80 hover:text-green-500 transition-colors flex items-center gap-2"
              >
                <span className="text-sm">$</span>
                <span>retry</span>
              </button>

              <button
                onClick={() => router.push("/")}
                className="text-green-500/80 hover:text-green-500 transition-colors flex items-center gap-2"
              >
                <span className="text-sm">$</span>
                <span>cd /home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
