/**
 * Dynamic YouTube Loader & Real-time Channel Feed Synchronizer
 * ============================================================
 * Enables automatic dynamic loading of newly uploaded videos and shorts
 * from YouTube channel @muralidharshenoykochi directly in the visitor's browser
 * on site load and refresh, without needing a site rebuild.
 */

export const YOUTUBE_CHANNEL_ID = 'UCZZkLUPMv1Ka4bNSyOpYGOA';
export const YOUTUBE_CHANNEL_HANDLE = '@muralidharshenoykochi';
export const STORAGE_KEY = 'ms_dynamic_youtube_videos';

/**
 * Format relative time ago string
 */
export function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Recent';
  const pub = new Date(dateStr).getTime();
  if (isNaN(pub)) return 'Recent';
  const diffMs = Date.now() - pub;
  if (diffMs < 0) return 'Just now';
  const diffHours = Math.floor(diffMs / (3600 * 1000));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1d ago';
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

/**
 * Extract YouTube 11-char video ID from various payload formats
 */
export function extractVideoId(item) {
  if (!item) return null;
  if (item.videoId && typeof item.videoId === 'string') return item.videoId;
  if (item.guid && typeof item.guid === 'string') {
    const m = item.guid.match(/yt:video:([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
  }
  if (item.link && typeof item.link === 'string') {
    const m = item.link.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    const ms = item.link.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (ms) return ms[1];
  }
  if (item.url && typeof item.url === 'string') {
    const m = item.url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (m) return m[1];
    const ms = item.url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (ms) return ms[1];
  }
  return null;
}

/**
 * Parse an incoming RSS/JSON entry into the site's standardized media item schema
 */
export function parseFeedItem(raw) {
  if (!raw) return null;
  const videoId = extractVideoId(raw);
  if (!videoId) return null;

  const title = (raw.title || '').trim();
  const rawDate = raw.pubDate || raw.date_published || raw.date || '';
  const date = rawDate ? rawDate.split('T')[0].split(' ')[0] : new Date().toISOString().split('T')[0];
  const isShort = (raw.type === 'Short') || /#shorts?\b/i.test(title) || (raw.link && raw.link.includes('/shorts/'));
  const views = raw.views || (raw.enclosure?.views) || '';

  return {
    id: `yt-${videoId}`,
    videoId,
    title,
    type: isShort ? 'Short' : 'Video',
    platform: 'YouTube',
    date,
    views: views ? (views.toLowerCase().includes('view') ? views : `${views} views`) : 'New Release',
    timeAgo: formatTimeAgo(rawDate || date),
    url: isShort ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    description: raw.description || 'Official vocal performance by Muralidhar Shenoy on YouTube.'
  };
}

/**
 * Merge two sets of media items, preserving custom metadata & sorting chronologically
 */
export function mergeMediaChronological(existingList = [], incomingList = []) {
  const map = new Map();

  // 1. Register existing items
  for (const item of (existingList || [])) {
    if (!item) continue;
    const key = item.videoId || item.id;
    if (key) map.set(key, item);
  }

  // 2. Merge incoming items
  for (const item of (incomingList || [])) {
    if (!item) continue;
    const key = item.videoId || item.id;
    if (!key) continue;

    if (map.has(key)) {
      const existing = map.get(key);
      map.set(key, {
        ...existing,
        ...item,
        // Preserve existing detailed views if incoming is generic
        views: existing.views && !existing.views.includes('New Release') ? existing.views : (item.views || existing.views || ''),
        description: existing.description || item.description || 'Official vocal performance by Muralidhar Shenoy on YouTube.',
        thumbnail: item.thumbnail || existing.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`
      });
    } else {
      map.set(key, item);
    }
  }

  // 3. Sort strictly chronologically descending (newest first)
  return Array.from(map.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

/**
 * Retrieve initial dynamic videos synchronously from localStorage if cached,
 * merged with fallback bundled videos to guarantee zero layout shift on initial render.
 */
export function getInitialDynamicVideos(fallbackVideos = []) {
  if (typeof window === 'undefined') return fallbackVideos;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.videos) ? parsed.videos : null);
      if (list && list.length > 0) {
        return mergeMediaChronological(fallbackVideos, list);
      }
    }
  } catch (e) {
    console.warn('[Dynamic YouTube] Storage read error:', e);
  }
  return fallbackVideos;
}

/**
 * Fetch latest videos dynamically directly from YouTube RSS feed via CORS proxy
 */
export async function fetchDynamicYouTubeVideos(fallbackVideos = [], options = {}) {
  const timeoutMs = options.timeout || 6000;
  let fetchedItems = [];

  // Attempt 1: Query local Studio backend server if running (fastest & most complete when running locally)
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      const studioRes = await fetch('http://localhost:3001/api/sync-youtube', {
        method: 'POST',
        signal: AbortSignal.timeout(4000)
      });
      if (studioRes.ok) {
        const studioData = await studioRes.json();
        if (studioData.success && Array.isArray(studioData.videos) && studioData.videos.length > 0) {
          fetchedItems = studioData.videos;
        }
      }
    } catch (e) {
      // Local studio backend not available, proceed to public RSS fetch
    }
  }

  // Attempt 2: Public YouTube Channel RSS feed via CORS-enabled rss2json
  if (fetchedItems.length === 0) {
    try {
      const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
      const res = await fetch(proxyUrl, {
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === 'ok' && Array.isArray(data.items)) {
          fetchedItems = data.items
            .map(parseFeedItem)
            .filter(Boolean);
        }
      }
    } catch (err) {
      console.warn('[Dynamic YouTube] RSS proxy error:', err.message);
    }
  }

  if (fetchedItems.length === 0) {
    // If network fetch failed, return what we currently have
    return getInitialDynamicVideos(fallbackVideos);
  }

  // Merge newly fetched items with fallback videos and stored items
  const cached = getInitialDynamicVideos(fallbackVideos);
  const merged = mergeMediaChronological(cached, fetchedItems);

  // Cache in localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: Date.now(),
        count: merged.length,
        videos: merged
      }));
      // Dispatch real-time event for any mounted components
      window.dispatchEvent(new CustomEvent('ms_videos_updated', { detail: merged }));
    } catch (e) {
      console.warn('[Dynamic YouTube] Storage write error:', e);
    }
  }

  return merged;
}
