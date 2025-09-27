import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory cache for server-side caching
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// File-based cache for persistence across server restarts
const CACHE_DIR = path.join(process.cwd(), '.next/cache');
const CACHE_FILE = path.join(CACHE_DIR, 'github-contributions.json');

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

// Initialize cache from file
loadFileCache();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'Msparihar';

  try {
    // Check if we have cached data
    const cached = cache.get(username);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      return NextResponse.json({
        data: cached.data,
        cached: true,
        cachedAt: new Date(cached.timestamp).toISOString()
      });
    }

    // Fetch fresh data from GitHub API
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

    return NextResponse.json({
      data,
      cached: false,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);

    // If we have stale cached data, return it
    const staleCache = cache.get(username);
    if (staleCache) {
      return NextResponse.json({
        data: staleCache.data,
        cached: true,
        stale: true,
        cachedAt: new Date(staleCache.timestamp).toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch contributions', message: error.message },
      { status: 500 }
    );
  }
}