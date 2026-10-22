// Realtime Analytics & Counter Utility using API Ninjas
export const API_KEY = 'd43hYDZXlvx2kymEjDOHk8hxdmbdDCtqSZEQZ04h';
export const COUNTER_BASE_URL = 'https://api.api-ninjas.com/v1/counter';

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const COUNTER_ALIASES = {
  'total_book_ticket_clicks': 'tot_book_tickets',
  'total_interested_clicks': 'tot_interested',
  'social_clicks_facebook': 'soc_click_fb',
  'social_clicks_youtube': 'soc_click_yt',
  'social_clicks_instagram': 'soc_click_insta',
  'social_clicks_spotify': 'soc_click_spotify',
  'youtube_subscribe_clicks': 'yt_sub_clicks',
  'total_song_plays': 'total_song_plays',
  'total_video_views': 'total_video_views',
  'total_short_views': 'total_short_views',
  'total_media_views': 'total_media_views',
  'site_visits': 'site_visits',
  'enquiry_form_clicks': 'enquiry_form_clicks',
  'enquiry_form_submits': 'enquiry_form_submits'
};

// API Ninjas strictly enforces: ID length must be between 1 and 20 characters
export function sanitizeCounterId(name) {
  if (!name) return 'counter_default';
  const clean = String(name).trim();
  if (COUNTER_ALIASES[clean]) {
    return COUNTER_ALIASES[clean];
  }
  const slug = clean
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');
  if (slug.length <= 20) {
    return slug;
  }
  const shortSlug = slug.slice(0, 14).replace(/_$/, '');
  const hash = Math.abs(hashString(clean)).toString(36).slice(0, 5);
  return `${shortSlug}_${hash}`.slice(0, 20);
}

export function getSongCounterId(trackOrTitle) {
  if (!trackOrTitle) return 'sp_default';
  const title = typeof trackOrTitle === 'string' ? trackOrTitle : (trackOrTitle.title || 'track');
  return sanitizeCounterId(`song_plays_${title}`);
}

export async function incrementCounter(counterName) {
  try {
    const id = sanitizeCounterId(counterName);
    // API Ninjas increments by 1 when hit=true is passed
    const res = await fetch(`${COUNTER_BASE_URL}?id=${encodeURIComponent(id)}&hit=true`, {
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

let lastRecordedSong = '';
let lastRecordedSongTime = 0;

export function recordSongPlay(track) {
  if (!track) return;
  const title = typeof track === 'string' ? track : (track.title || 'Unknown Track');
  const now = Date.now();
  if (lastRecordedSong === title && now - lastRecordedSongTime < 1500) {
    return; // Deduplicate rapid clicks
  }
  lastRecordedSong = title;
  lastRecordedSongTime = now;

  const counterId = getSongCounterId(title);

  // 1. Increment remote API Ninjas counters asynchronously
  incrementCounter(counterId);
  incrementCounter('total_song_plays');

  // 2. Track in local storage for instantaneous UI feedback & persistence across refreshes
  try {
    const plays = JSON.parse(localStorage.getItem('ms_song_plays') || '{}');
    plays[title] = (plays[title] || 0) + 1;
    plays['__total__'] = (plays['__total__'] || 0) + 1;
    localStorage.setItem('ms_song_plays', JSON.stringify(plays));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ms_song_plays_updated', {
        detail: { title, count: plays[title], total: plays['__total__'], track }
      }));
    }
  } catch (e) {}
}

export function getLocalSongPlays() {
  try {
    if (typeof window === 'undefined') return {};
    return JSON.parse(localStorage.getItem('ms_song_plays') || '{}');
  } catch (e) {
    return {};
  }
}

export function getVideoCounterId(video) {
  if (!video) return 'mv_unknown';
  const prefix = video.type === 'Short' ? 'sh_' : 'vd_';
  const rawId = video.videoId || video.id || video.title || 'media';
  return sanitizeCounterId(prefix + rawId);
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
