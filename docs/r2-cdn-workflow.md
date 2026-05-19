# R2 CDN Workflow

Portfolio images are served from Cloudflare R2 via a custom domain.

## Setup summary

| Item | Value |
|---|---|
| Bucket | `portfolio-cdn` |
| Region | ENAM (Eastern North America) |
| Custom domain | `cdn.manishsingh.tech` |
| r2.dev fallback | `pub-17427c9fa145483faa827eedd3fddbe1.r2.dev` |
| DNS | Auto-managed by Cloudflare (zone: manishsingh.tech) |

Custom domain was configured via Cloudflare R2 → Custom Domains API. Cloudflare creates the CNAME automatically since the zone is on the same account.

## Bucket structure

```
portfolio-cdn/
  images/
    *.jpg / *.png / *.gif / *.mp4 / *.webm   ← project thumbnails, videos
    blog/                                       ← blog cover images
    design-references/                          ← posthog design refs (internal)
    optimized/                                  ← avif/webp/jpg variants (pre-gen)
    worlds/
      elden-ring/
        wallpaper-ai.png     ← original AI wallpaper (~2.3 MB)
        wallpaper-ai.webp    ← WebP variant (~110 KB, quality 85)
        wallpaper.webp       ← hand-crafted wallpaper
      ghibli/
        wallpaper-ai.png     ← original AI wallpaper (~2.9 MB)
        wallpaper-ai.webp    ← WebP variant (~220 KB, quality 85)
        wallpaper.webp
      got/
        dragonstone/wallpaper.webp
        kings-landing/wallpaper.webp
        nights-watch/wallpaper.webp
        north/
          wallpaper-ai.png   ← original AI wallpaper (~2.5 MB)
          wallpaper-ai.webp  ← WebP variant (~152 KB, quality 85)
          wallpaper.webp
```

## How to add a new image

1. Drop the file in `public/images/` (preserving any subdirectory you want).
2. Run the upload script:

```bash
CLOUDFLARE_ACCOUNT_ID=fc7a0d1868d4e4c274b6fcf49bef29d3 \
CLOUDFLARE_API_KEY=<key from ~/.env.local> \
CLOUDFLARE_EMAIL=manishsparihar2020@gmail.com \
node scripts/upload-to-r2.mjs
```

The script is idempotent — it re-uploads every file in `public/images/`, so existing files get overwritten with the latest version. The manifest at `docs/r2-asset-manifest.json` is regenerated on each run.

3. If the file is a large PNG AI wallpaper, also generate a WebP variant:

```bash
# Edit scripts/generate-webp.mjs to add your file path to AI_WALLPAPERS array,
# then run:
node scripts/generate-webp.mjs
# Upload both .png and .webp (they'll be picked up by the upload script above)
```

## WebP variants

The three AI wallpapers ship as both `.png` (original) and `.webp` (quality 85):

| File | Original | WebP | Savings |
|---|---|---|---|
| elden-ring/wallpaper-ai | ~2.3 MB | ~110 KB | 96.6% |
| ghibli/wallpaper-ai | ~2.9 MB | ~220 KB | 94.2% |
| got/north/wallpaper-ai | ~2.5 MB | ~152 KB | 95.8% |

Phase 2 code migration should serve `.webp` by default and fall back to `.png`.

## Asset manifest

`docs/r2-asset-manifest.json` maps every local path → CDN URL. Shape:

```json
{
  "bucket": "portfolio-cdn",
  "cdnBase": "https://cdn.manishsingh.tech",
  "r2DevBase": "https://pub-17427c9fa145483faa827eedd3fddbe1.r2.dev",
  "uploadedAt": "...",
  "assets": {
    "public/images/worlds/ghibli/wallpaper-ai.png": "https://cdn.manishsingh.tech/images/worlds/ghibli/wallpaper-ai.png",
    "public/images/worlds/ghibli/wallpaper-ai.webp": "https://cdn.manishsingh.tech/images/worlds/ghibli/wallpaper-ai.webp"
  }
}
```

Phase 2 can import this manifest at build time to resolve paths, or the Next.js config can rewrite `/images/*` → CDN automatically.

## What next.config.mjs needs (Phase 2)

To enable Next.js `<Image>` component to load from the CDN, add the domain to `remotePatterns`:

```js
// next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.manishsingh.tech",
        pathname: "/images/**",
      },
    ],
  },
};
```

For non-`<Image>` references (CSS `background-image`, raw `<img>` tags, world config strings), Phase 2 simply replaces `/images/` path prefixes with `https://cdn.manishsingh.tech/images/`.

## Limits and gotchas

**R2 free tier** (as of 2026):
- Storage: 10 GB/month free. Current bucket: ~39 MB total — well within free.
- Class A ops (writes): 1M/month free. One upload run ≈ 112 ops. Fine.
- Class B ops (reads): 10M/month free. Portfolio traffic shouldn't approach this.
- Egress: R2 has **no egress fees** — images served via CDN are free.

**Large file uploads**: Files above ~2 MB occasionally hit network timeouts on Windows
via wrangler. The upload script catches these and reports them. Re-running the script
(idempotent) will retry them. The three AI wallpaper PNGs (2-3 MB each) may need 1-2
retries on flaky connections.

**Cache**: Cloudflare caches R2 objects at the edge automatically when served via a
custom domain. Cache TTL follows Cloudflare's default (4h for images). To bust cache
after updating a file, use Cloudflare's Cache Purge API or append a query string to
the URL during development.

**CORS**: R2 does not set CORS headers by default. If the portfolio makes `fetch()`
calls to the CDN (e.g., for JSON manifests), add a CORS policy to the bucket via
the Cloudflare dashboard → R2 → portfolio-cdn → Settings → CORS Policy.

**r2.dev fallback**: `pub-17427c9fa145483faa827eedd3fddbe1.r2.dev` is active and
working, but Cloudflare recommends custom domains for production (better rate limits
and caching). Use r2.dev only for debugging.
