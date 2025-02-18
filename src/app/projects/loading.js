import LoadingDots from "@/components/ui/LoadingDots";

export default function Loading() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8 flex items-center justify-between opacity-50">
          <div className="text-green-500/80 flex items-center gap-2">
            <span className="text-sm">$</span>
            <span className="text-muted-foreground">cd ..</span>
          </div>
        </div>

        {/* Grid background with fade */}
        <div className="relative rounded-lg overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-grid-small-white/[0.1] bg-black/95" />

          {/* Radial gradient for fading effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

          {/* Content */}
          <div className="relative z-10 p-6">
            <h1 className="text-4xl font-bold mb-8 text-green-500/80 flex items-center gap-4">
              <span className="text-sm mr-2">$</span>
              ls /projects
              <LoadingDots />
            </h1>

            {/* Loading grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden bg-black/90 h-64 animate-pulse"
                >
                  <div className="absolute inset-0 bg-grid-small-white/[0.05]" />
                  <div className="p-6 relative z-10">
                    <div className="h-6 w-32 bg-green-500/10 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-green-500/10 rounded" />
                      <div className="h-4 w-3/4 bg-green-500/10 rounded" />
                      <div className="h-4 w-1/2 bg-green-500/10 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
