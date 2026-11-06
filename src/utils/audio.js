/**
 * Audio helpers for Music Showcase and Player.
 */

export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function resolveAudioSrc(url, env = {}) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    if (env.isDev || env.isElectron) {
      return `http://localhost:3001${trimmed}`;
    }
    const base = env.baseUrl || './';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${trimmed.replace(/^\//, '')}`;
  }
  return trimmed;
}

export function filterTracksByLanguage(tracks, selectedLanguage) {
  if (!Array.isArray(tracks)) return [];
  if (!selectedLanguage || selectedLanguage.toLowerCase() === 'all') return tracks;
  return tracks.filter(t => (t.language || '').toLowerCase() === selectedLanguage.toLowerCase());
}
