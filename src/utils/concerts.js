/**
 * Utility functions for concerts and tour dates.
 * Ensures past concerts are automatically excluded both at runtime and during build/prune,
 * and upcoming concerts are strictly sorted in chronological order (earliest first).
 */

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatConcertFormEmbedUrl(url) {
  if (!url) {
    return 'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform?embedded=true';
  }
  const trimmed = String(url).trim();
  if (trimmed.includes('embedded=true')) return trimmed;
  if (trimmed.includes('/preview')) {
    return trimmed.replace(/\/preview(\?.*)?$/, '/viewform?embedded=true');
  }
  if (trimmed.includes('/viewform')) {
    return trimmed.replace(/\/viewform(\?.*)?$/, '/viewform?embedded=true');
  }
  if (trimmed.startsWith('https://docs.google.com/forms/d/')) {
    return `${trimmed.replace(/\/+$/, '')}/viewform?embedded=true`;
  }
  return trimmed;
}

export function formatConcertDate(dateInput) {
  if (!dateInput) return '';
  const d = parseConcertDate(dateInput);
  if (!d) return String(dateInput);
  const m = MONTH_NAMES[d.getMonth()] || '';
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${m} ${day}, ${year}`;
}

export function parseConcertDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return null;
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  }

  const str = String(dateStr).trim();
  // 1. Check for YYYY-MM-DD format (e.g. 2026-11-08)
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // 2. Check for "MMM DD, YYYY" or "MMM DD YYYY" (e.g. "DEC 20, 2026" or "DEC 21 2026")
  const mdyMatch = str.match(/^([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})/i);
  if (mdyMatch) {
    const monthStr = mdyMatch[1].toUpperCase().slice(0, 3);
    const monthIdx = MONTH_NAMES.indexOf(monthStr);
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    if (monthIdx !== -1) {
      const d = new Date(year, monthIdx, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // 3. Fallback to standard Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return null;
}

export function getEventDate(evt) {
  if (!evt) return null;
  // If formattedDate has a parseable date, check it
  const fdParsed = parseConcertDate(evt.formattedDate);
  const dParsed = parseConcertDate(evt.date);

  // If both exist and formattedDate is parseable, prefer formattedDate if it has month/day/year
  // because that is what is visibly shown on the concert badge.
  if (fdParsed && !dParsed) return fdParsed;
  if (dParsed && !fdParsed) return dParsed;
  if (fdParsed && dParsed) {
    // If they differ, the displayed formattedDate is what visitors see
    return fdParsed;
  }
  return null;
}

export function isUpcomingConcert(event, referenceDate = new Date()) {
  if (!event) return false;

  const eventDate = getEventDate(event);
  if (!eventDate) return false;

  const today = parseConcertDate(referenceDate) || new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  return eventDate.getTime() >= today.getTime();
}

export function filterUpcomingConcerts(events, referenceDate = new Date()) {
  if (!Array.isArray(events)) return [];
  return events.filter(evt => isUpcomingConcert(evt, referenceDate));
}

export function sortConcertsAscending(events) {
  if (!Array.isArray(events)) return [];
  return [...events].sort((a, b) => {
    const da = getEventDate(a)?.getTime() || 0;
    const db = getEventDate(b)?.getTime() || 0;
    return da - db;
  });
}
