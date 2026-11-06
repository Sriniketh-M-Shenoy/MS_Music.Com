/**
 * Utility functions for concerts and tour dates.
 * Ensures past concerts are automatically excluded both at runtime and during build/prune.
 */

export function parseConcertDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) {
    if (isNaN(dateStr.getTime())) return null;
    return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
  }

  const str = String(dateStr).trim();
  // Check for YYYY-MM-DD format (e.g. 2026-11-08)
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to standard Date parsing
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  return null;
}

export function isUpcomingConcert(event, referenceDate = new Date()) {
  if (!event || !event.date) return false;

  const eventDate = parseConcertDate(event.date);
  if (!eventDate) return true; // keep if non-standard or unparseable

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
    const da = parseConcertDate(a?.date)?.getTime() || 0;
    const db = parseConcertDate(b?.date)?.getTime() || 0;
    return da - db;
  });
}
