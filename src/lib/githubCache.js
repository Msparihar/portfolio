// GitHub Contributions Caching Utility
const CACHE_KEY = "github-contributions";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const getCachedContributions = () => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within 24 hours)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Error reading cached contributions:", error);
    return null;
  }
};

export const setCachedContributions = (data) => {
  if (typeof window === "undefined") return;

  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error caching contributions:", error);
  }
};

export const clearCachedContributions = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error("Error clearing cached contributions:", error);
  }
};

// Server-side caching for GitHub API
export const fetchGitHubContributions = async (username) => {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "Portfolio-App/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching GitHub contributions:", error);
    throw error;
  }
};
