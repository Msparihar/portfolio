import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Basic configuration for Cloudflare Workers deployment
  // Can be extended later with:
  // - R2 incremental cache for ISR: incrementalCache: r2IncrementalCache
  // - Custom image optimization
  // - Middleware configurations
});