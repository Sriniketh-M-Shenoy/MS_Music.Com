/**
 * Pure search and category filtering utility for Media items (Videos, Shorts, Socials).
 */

export function filterMediaItems(items, { filter = 'all', query = '' } = {}) {
  if (!Array.isArray(items)) return [];
  const cleanQuery = (query || '').trim().toLowerCase();

  return items.filter(item => {
    // 1. Tab category filter
    if (filter === 'videos' && (!item.isYouTube || item.type !== 'Video')) return false;
    if (filter === 'shorts' && (!item.isYouTube || item.type !== 'Short')) return false;
    if (filter === 'socials' && item.isYouTube) return false;

    // 2. Search query filter across title, description, type and platform
    if (cleanQuery) {
      const titleMatch = (item.title || '').toLowerCase().includes(cleanQuery);
      const descMatch = (item.description || '').toLowerCase().includes(cleanQuery);
      const typeMatch = (item.type || '').toLowerCase().includes(cleanQuery);
      const platformMatch = (item.platform || '').toLowerCase().includes(cleanQuery);
      if (!titleMatch && !descMatch && !typeMatch && !platformMatch) return false;
    }

    return true;
  });
}
