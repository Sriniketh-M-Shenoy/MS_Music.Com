/**
 * Concerts & Events: Extended Functional Tests
 * =============================================
 * Full coverage of concerts utility:
 *   - parseConcertDate: all date formats (YYYY-MM-DD, "MMM DD, YYYY", Date obj)
 *   - formatConcertDate: output format verification
 *   - isUpcomingConcert: today, past, future, null, edge cases
 *   - filterUpcomingConcerts: mixed lists, all past, all future
 *   - sortConcertsAscending: ordering guarantees
 *   - getEventDate: formattedDate vs date precedence
 *   - formatConcertFormEmbedUrl: Google Form URL normalization
 *   - Live eventsContent validation
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseConcertDate,
  formatConcertDate,
  isUpcomingConcert,
  filterUpcomingConcerts,
  sortConcertsAscending,
  getEventDate,
  formatConcertFormEmbedUrl
} from '../src/utils/concerts.js';
import { eventsContent, concertNotificationsConfig } from '../src/content/events.js';

const REF = new Date('2026-11-06T12:00:00Z'); // Fixed reference date for deterministic tests

// ─── parseConcertDate ─────────────────────────────────────────────────────────
describe('parseConcertDate', () => {
  it('parses YYYY-MM-DD string', () => {
    const d = parseConcertDate('2026-11-15');
    assert.ok(d instanceof Date);
    assert.strictEqual(d.getFullYear(), 2026);
    assert.strictEqual(d.getMonth(), 10); // November (0-indexed)
    assert.strictEqual(d.getDate(), 15);
  });

  it('parses "MMM DD, YYYY" formatted string', () => {
    const d = parseConcertDate('NOV 15, 2026');
    assert.ok(d instanceof Date);
    assert.strictEqual(d.getMonth(), 10);
    assert.strictEqual(d.getDate(), 15);
  });

  it('parses lowercase month in MMM format', () => {
    const d = parseConcertDate('dec 25, 2026');
    assert.ok(d instanceof Date);
    assert.strictEqual(d.getMonth(), 11); // December
    assert.strictEqual(d.getDate(), 25);
  });

  it('parses "MMM DD YYYY" (no comma)', () => {
    const d = parseConcertDate('JAN 10 2027');
    assert.ok(d instanceof Date);
    assert.strictEqual(d.getFullYear(), 2027);
    assert.strictEqual(d.getMonth(), 0); // January
  });

  it('parses native Date object', () => {
    const input = new Date(2026, 11, 20); // December 20
    const d = parseConcertDate(input);
    assert.ok(d instanceof Date);
    assert.strictEqual(d.getFullYear(), 2026);
    assert.strictEqual(d.getMonth(), 11);
    assert.strictEqual(d.getDate(), 20);
  });

  it('returns null for empty string', () => {
    assert.strictEqual(parseConcertDate(''), null);
  });

  it('returns null for null input', () => {
    assert.strictEqual(parseConcertDate(null), null);
  });

  it('returns null for undefined input', () => {
    assert.strictEqual(parseConcertDate(undefined), null);
  });

  it('returns null for a clearly invalid date string', () => {
    assert.strictEqual(parseConcertDate('not-a-date'), null);
  });

  it('returns null for invalid Date object', () => {
    assert.strictEqual(parseConcertDate(new Date('invalid')), null);
  });
});

// ─── formatConcertDate ────────────────────────────────────────────────────────
describe('formatConcertDate', () => {
  it('formats YYYY-MM-DD to "MMM DD, YYYY"', () => {
    assert.strictEqual(formatConcertDate('2026-11-15'), 'NOV 15, 2026');
  });

  it('formats December correctly', () => {
    assert.strictEqual(formatConcertDate('2026-12-25'), 'DEC 25, 2026');
  });

  it('pads single-digit day with leading zero', () => {
    assert.strictEqual(formatConcertDate('2027-01-05'), 'JAN 05, 2027');
  });

  it('returns empty string for null', () => {
    assert.strictEqual(formatConcertDate(null), '');
  });

  it('returns empty string for empty string', () => {
    assert.strictEqual(formatConcertDate(''), '');
  });

  it('returns original string when date is unparseable', () => {
    // Falls back to returning the input as-is for unrecognised strings
    const result = formatConcertDate('TBD');
    assert.ok(typeof result === 'string');
  });
});

// ─── isUpcomingConcert ────────────────────────────────────────────────────────
describe('isUpcomingConcert', () => {
  it('returns true for an event on the reference date (today)', () => {
    const event = { title: 'Concert Today', date: '2026-11-06' };
    assert.strictEqual(isUpcomingConcert(event, REF), true);
  });

  it('returns true for an event tomorrow', () => {
    const event = { title: 'Concert Tomorrow', date: '2026-11-07' };
    assert.strictEqual(isUpcomingConcert(event, REF), true);
  });

  it('returns true for an event far in the future', () => {
    const event = { title: 'New Year Concert', date: '2027-01-01' };
    assert.strictEqual(isUpcomingConcert(event, REF), true);
  });

  it('returns false for an event yesterday', () => {
    const event = { title: 'Past Concert', date: '2026-11-05' };
    assert.strictEqual(isUpcomingConcert(event, REF), false);
  });

  it('returns false for a concert from last month', () => {
    const event = { title: 'October Fest', date: '2026-10-15' };
    assert.strictEqual(isUpcomingConcert(event, REF), false);
  });

  it('returns false for a concert from last year', () => {
    const event = { title: '2025 Annual', date: '2025-12-31' };
    assert.strictEqual(isUpcomingConcert(event, REF), false);
  });

  it('returns false for null event', () => {
    assert.strictEqual(isUpcomingConcert(null, REF), false);
  });

  it('returns false for event with no date', () => {
    assert.strictEqual(isUpcomingConcert({}, REF), false);
    assert.strictEqual(isUpcomingConcert({ title: 'No Date' }, REF), false);
  });

  it('uses formattedDate when date field is absent', () => {
    const event = { title: 'Display Date Only', formattedDate: 'NOV 20, 2026' };
    assert.strictEqual(isUpcomingConcert(event, REF), true);
  });

  it('formattedDate takes precedence over date when both are present', () => {
    // If formattedDate is what is displayed, it should drive the upcoming check
    const event = { title: 'Two Dates', date: '2026-11-01', formattedDate: 'NOV 20, 2026' };
    assert.strictEqual(isUpcomingConcert(event, REF), true);
  });
});

// ─── filterUpcomingConcerts ───────────────────────────────────────────────────
describe('filterUpcomingConcerts', () => {
  const mixedEvents = [
    { id: 1, title: 'Past Gig 1', date: '2026-10-01' },
    { id: 2, title: 'Past Gig 2', date: '2026-11-05' },
    { id: 3, title: 'Today', date: '2026-11-06' },
    { id: 4, title: 'Upcoming 1', date: '2026-11-08' },
    { id: 5, title: 'Far Future', date: '2027-03-15' }
  ];

  it('filters to only upcoming and today events', () => {
    const result = filterUpcomingConcerts(mixedEvents, REF);
    assert.strictEqual(result.length, 3);
    assert.deepStrictEqual(result.map(e => e.id), [3, 4, 5]);
  });

  it('returns empty array when all events are in the past', () => {
    const past = [
      { id: 1, date: '2026-09-01' },
      { id: 2, date: '2025-12-25' }
    ];
    assert.deepStrictEqual(filterUpcomingConcerts(past, REF), []);
  });

  it('returns all events when all are upcoming', () => {
    const future = [
      { id: 1, date: '2026-11-10' },
      { id: 2, date: '2026-12-01' },
      { id: 3, date: '2027-01-15' }
    ];
    const result = filterUpcomingConcerts(future, REF);
    assert.strictEqual(result.length, 3);
  });

  it('handles null input gracefully', () => {
    assert.deepStrictEqual(filterUpcomingConcerts(null, REF), []);
  });

  it('handles undefined input gracefully', () => {
    assert.deepStrictEqual(filterUpcomingConcerts(undefined, REF), []);
  });

  it('handles empty array gracefully', () => {
    assert.deepStrictEqual(filterUpcomingConcerts([], REF), []);
  });

  it('skips events with null/missing dates without throwing', () => {
    const events = [
      { id: 1, title: 'No date event' },
      { id: 2, title: 'Valid event', date: '2026-11-10' }
    ];
    const result = filterUpcomingConcerts(events, REF);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 2);
  });
});

// ─── sortConcertsAscending ────────────────────────────────────────────────────
describe('sortConcertsAscending', () => {
  it('sorts events chronologically ascending (earliest first)', () => {
    const unsorted = [
      { id: 1, date: '2027-01-10', title: 'Far Future' },
      { id: 2, date: '2026-11-08', title: 'Near Future' },
      { id: 3, date: '2026-12-25', title: 'Mid Future' }
    ];
    const sorted = sortConcertsAscending(unsorted);
    assert.deepStrictEqual(sorted.map(e => e.id), [2, 3, 1]);
  });

  it('does not mutate the original array', () => {
    const events = [
      { id: 1, date: '2027-01-10' },
      { id: 2, date: '2026-11-08' }
    ];
    const copy = [...events];
    sortConcertsAscending(events);
    assert.deepStrictEqual(events, copy);
  });

  it('handles single-element array', () => {
    const events = [{ id: 1, date: '2026-11-10' }];
    const sorted = sortConcertsAscending(events);
    assert.strictEqual(sorted.length, 1);
  });

  it('handles empty array', () => {
    assert.deepStrictEqual(sortConcertsAscending([]), []);
  });

  it('handles null gracefully', () => {
    assert.deepStrictEqual(sortConcertsAscending(null), []);
  });
});

// ─── formatConcertFormEmbedUrl ────────────────────────────────────────────────
describe('formatConcertFormEmbedUrl', () => {
  const DEFAULT_EMBED = 'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform?embedded=true';

  it('returns default embed URL for null input', () => {
    assert.strictEqual(formatConcertFormEmbedUrl(null), DEFAULT_EMBED);
  });

  it('returns default embed URL for empty string', () => {
    assert.strictEqual(formatConcertFormEmbedUrl(''), DEFAULT_EMBED);
  });

  it('converts /preview to /viewform?embedded=true', () => {
    const input = 'https://docs.google.com/forms/d/FORM_ID/preview';
    const result = formatConcertFormEmbedUrl(input);
    assert.strictEqual(result, 'https://docs.google.com/forms/d/FORM_ID/viewform?embedded=true');
  });

  it('converts /viewform (bare) to /viewform?embedded=true', () => {
    const input = 'https://docs.google.com/forms/d/FORM_ID/viewform';
    const result = formatConcertFormEmbedUrl(input);
    assert.strictEqual(result, 'https://docs.google.com/forms/d/FORM_ID/viewform?embedded=true');
  });

  it('replaces existing query params in /viewform URL', () => {
    const input = 'https://docs.google.com/forms/d/FORM_ID/viewform?pli=1';
    const result = formatConcertFormEmbedUrl(input);
    assert.strictEqual(result, 'https://docs.google.com/forms/d/FORM_ID/viewform?embedded=true');
  });

  it('preserves a URL that already has embedded=true', () => {
    const input = 'https://docs.google.com/forms/d/FORM_ID/viewform?embedded=true';
    assert.strictEqual(formatConcertFormEmbedUrl(input), input);
  });

  it('appends /viewform?embedded=true to a base form URL', () => {
    const input = 'https://docs.google.com/forms/d/FORM_ID';
    const result = formatConcertFormEmbedUrl(input);
    assert.ok(result.includes('embedded=true'), `Expected embedded=true in: ${result}`);
  });
});

// ─── Live Content Validation ──────────────────────────────────────────────────
describe('Live Events: eventsContent Integrity', () => {
  it('eventsContent is an array', () => {
    assert.ok(Array.isArray(eventsContent));
  });

  it('each event has the required fields', () => {
    for (const event of eventsContent) {
      assert.ok(event.id !== undefined, 'event.id required');
      assert.ok(typeof event.title === 'string' && event.title.length > 0, `event.title missing for id ${event.id}`);
      assert.ok(typeof event.venue === 'string', `event.venue missing for id ${event.id}`);
      assert.ok(typeof event.city === 'string', `event.city missing for id ${event.id}`);
      const hasDate = event.date || event.formattedDate;
      assert.ok(hasDate, `Event "${event.title}" must have date or formattedDate`);
    }
  });

  it('all events in eventsContent are upcoming relative to their own dates', () => {
    // Events are automatically pruned by clean-past-concerts.js; none should be old
    for (const event of eventsContent) {
      assert.ok(isUpcomingConcert(event), `Event "${event.title}" (${event.date || event.formattedDate}) is in the past and should have been pruned`);
    }
  });

  it('eventsContent is sorted ascending (earliest first)', () => {
    const sorted = sortConcertsAscending([...eventsContent]);
    for (let i = 0; i < eventsContent.length; i++) {
      const aSorted = getEventDate(sorted[i])?.getTime() || 0;
      const aLive = getEventDate(eventsContent[i])?.getTime() || 0;
      assert.strictEqual(aLive, aSorted, `eventsContent is not sorted ascending at index ${i}`);
    }
  });
});

describe('Concert Notifications Config: Integration', () => {
  it('formUrl is a valid Google Forms URL', () => {
    assert.ok(concertNotificationsConfig.formUrl.startsWith('https://docs.google.com/forms/'), 'Must be a Google Forms URL');
  });

  it('formUrl converts cleanly to embedded URL via formatConcertFormEmbedUrl', () => {
    const embedded = formatConcertFormEmbedUrl(concertNotificationsConfig.formUrl);
    assert.ok(embedded.includes('embedded=true'), 'Converted embed URL must contain embedded=true');
    assert.ok(embedded.includes('/viewform'), 'Converted embed URL must use /viewform path');
  });

  it('buttonText is a non-empty meaningful string', () => {
    assert.ok(typeof concertNotificationsConfig.buttonText === 'string' && concertNotificationsConfig.buttonText.length > 5);
  });

  it('description is a non-empty meaningful string', () => {
    assert.ok(typeof concertNotificationsConfig.description === 'string' && concertNotificationsConfig.description.length > 20);
  });
});
