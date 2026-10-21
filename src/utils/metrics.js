// Realtime Analytics & Counter Utility using API Ninjas
export const API_KEY = 'd43hYDZXlvx2kymEjDOHk8hxdmbdDCtqSZEQZ04h';
export const COUNTER_BASE_URL = 'https://api.api-ninjas.com/v1/counter';

export function sanitizeCounterId(name) {
  if (!name) return 'counter_default';
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
}

export async function incrementCounter(counterName) {
  try {
    const id = sanitizeCounterId(counterName);
    const res = await fetch(`${COUNTER_BASE_URL}?id=${encodeURIComponent(id)}&value=1`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.debug(`[Metrics] Increment error for "${counterName}":`, err.message);
    return null;
  }
}

export async function getCounterValue(counterName) {
  try {
    const id = sanitizeCounterId(counterName);
    const res = await fetch(`${COUNTER_BASE_URL}?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY
      }
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.value === 'number' ? data.value : 0;
  } catch (err) {
    console.debug(`[Metrics] Fetch error for "${counterName}":`, err.message);
    return 0;
  }
}

export function getVideoCounterId(video) {
  if (!video) return 'media_view_unknown';
  const prefix = video.type === 'Short' ? 'short_views_' : 'video_views_';
  const rawId = video.videoId || video.id || video.title;
  return prefix + sanitizeCounterId(rawId);
}

export function recordMediaClick(video) {
  if (!video) return;
  const counterId = getVideoCounterId(video);
  const totalCounter = video.type === 'Short' ? 'total_short_views' : 'total_video_views';

  // Increment remote API Ninjas counters asynchronously
  incrementCounter(counterId);
  incrementCounter(totalCounter);
  incrementCounter('total_media_views');

  // Track in local storage for instantaneous UI feedback & cross-tab sync
  try {
    const rawKey = video.videoId || video.id || video.title;
    const clicks = JSON.parse(localStorage.getItem('ms_media_clicks') || '{}');
    clicks[rawKey] = (clicks[rawKey] || 0) + 1;
    localStorage.setItem('ms_media_clicks', JSON.stringify(clicks));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ms_media_clicks_updated', {
        detail: { key: rawKey, count: clicks[rawKey], video }
      }));
    }
  } catch (e) {}
}

export function getLocalMediaClicks() {
  try {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem('ms_media_clicks') || '{}');
  } catch (e) {
    return {};
  }
}
