import fs from 'fs';
import path from 'path';

// In-memory cache for server-side caching
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// File-based cache for persistence across server restarts
const CACHE_DIR = path.join(process.cwd(), '.next/cache');
const CACHE_FILE = path.join(CACHE_DIR, 'github-contributions.json');

// Static fallback file
const FALLBACK_FILE = path.join(process.cwd(), 'public/fallback-github-data.json');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  } catch (err) {
    console.warn('Could not create cache directory:', err);
  }
}

// Load cache from file on startup
const loadFileCache = () => {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const fileContent = fs.readFileSync(CACHE_FILE, 'utf8');
      const fileCache = JSON.parse(fileContent);

      // Load valid cache entries into memory
      Object.entries(fileCache).forEach(([username, cached]) => {
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
          cache.set(username, cached);
        }
      });
    }
  } catch (err) {
    console.warn('Could not load file cache:', err);
  }
};

// Save cache to file
const saveFileCache = () => {
  try {
    const fileCacheData = {};
    cache.forEach((value, key) => {
      fileCacheData[key] = value;
    });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(fileCacheData, null, 2));
  } catch (err) {
    console.warn('Could not save file cache:', err);
  }
};

// Load static fallback data
const loadFallbackData = (username) => {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const fallbackContent = fs.readFileSync(FALLBACK_FILE, 'utf8');
      const fallbackData = JSON.parse(fallbackContent);

      // Check if fallback has data for this username
      if (fallbackData[username]) {
        return fallbackData[username];
      }
    }
  } catch (err) {
    console.warn('Could not load fallback data:', err);
  }
  return null;
};

// Initialize cache from file
loadFileCache();

/**
 * Fetch GitHub contributions with three-tier fallback:
 * 1. In-memory/file cache (< 24hrs)
 * 2. Fresh API fetch
 * 3. Static build-time fallback
 */
export async function getGithubContributions(username = 'Msparihar') {
  try {
    // Tier 1: Check if we have valid cached data
    const cached = cache.get(username);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return {
        data: cached.data,
        cached: true,
        cachedAt: new Date(cached.timestamp).toISOString()
      };
    }

    // Tier 2: Fetch fresh data from GitHub API
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Portfolio-App/1.0',
        },
        next: { revalidate: 86400 } // Revalidate every 24 hours
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    // Cache the data in memory and file
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };

    cache.set(username, cacheEntry);
    saveFileCache(); // Persist to file

    return {
      data,
      cached: false,
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);

    // Tier 2.5: If we have stale cached data, return it
    const staleCache = cache.get(username);
    if (staleCache) {
      return {
        data: staleCache.data,
        cached: true,
        stale: true,
        cachedAt: new Date(staleCache.timestamp).toISOString()
      };
    }

    // Tier 3: Return static fallback data
    const fallbackData = loadFallbackData(username);
    if (fallbackData) {
      return {
        data: fallbackData,
        fallback: true,
        message: 'Using static fallback data'
      };
    }

    // No data available at all
    return {
      error: true,
      message: error.message
    };
  }
}

/**
 * Save current data as fallback for build time
 */
export async function saveFallbackData(username = 'Msparihar') {
  try {
    const result = await getGithubContributions(username);

    if (result.data && !result.error) {
      const fallbackData = {
        [username]: result.data,
        generatedAt: new Date().toISOString()
      };

      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(fallbackData, null, 2));
      console.log('✅ Fallback data saved successfully');
      return true;
    }

    console.warn('⚠️ No data to save as fallback');
    return false;
  } catch (err) {
    console.error('❌ Failed to save fallback data:', err);
    return false;
  }
}