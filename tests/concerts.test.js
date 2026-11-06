import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseConcertDate, isUpcomingConcert, filterUpcomingConcerts, sortConcertsAscending } from '../src/utils/concerts.js';
import { sanitizeCounterId } from '../src/utils/metrics.js';

describe('Concerts Feature: Past Concert Removal and Ordering', () => {
  const referenceDate = new Date('2026-11-06T12:00:00Z');

  describe('parseConcertDate', () => {
    it('parses YYYY-MM-DD string correctly', () => {
      const d = parseConcertDate('2026-11-08');
      assert.ok(d instanceof Date);
      assert.strictEqual(d.getFullYear(), 2026);
      assert.strictEqual(d.getMonth(), 10); // 0-indexed: 10 = November
      assert.strictEqual(d.getDate(), 8);
    });

    it('parses Date instances', () => {
      const source = new Date(2026, 11, 25);
      const d = parseConcertDate(source);
      assert.strictEqual(d.getFullYear(), 2026);
      assert.strictEqual(d.getMonth(), 11);
      assert.strictEqual(d.getDate(), 25);
    });

    it('returns null for empty or invalid dates', () => {
      assert.strictEqual(parseConcertDate(''), null);
      assert.strictEqual(parseConcertDate(null), null);
      assert.strictEqual(parseConcertDate('not-a-date'), null);
    });
  });

  describe('isUpcomingConcert', () => {
    it('returns true for concerts scheduled on the reference date (today)', () => {
      const event = { title: 'Today Concert', date: '2026-11-06' };
      assert.strictEqual(isUpcomingConcert(event, referenceDate), true);
    });

    it('returns true for concerts in the future', () => {
      const event = { title: 'Future Recital', date: '2026-11-20' };
      assert.strictEqual(isUpcomingConcert(event, referenceDate), true);
    });

    it('returns false for concerts strictly in the past', () => {
      const yesterdayEvent = { title: 'Yesterday Concert', date: '2026-11-05' };
      const lastMonthEvent = { title: 'Last Month Tour', date: '2026-10-15' };
      const lastYearEvent = { title: '2025 Concert', date: '2025-12-31' };

      assert.strictEqual(isUpcomingConcert(yesterdayEvent, referenceDate), false);
      assert.strictEqual(isUpcomingConcert(lastMonthEvent, referenceDate), false);
      assert.strictEqual(isUpcomingConcert(lastYearEvent, referenceDate), false);
    });

    it('returns false if event is null or has no date', () => {
      assert.strictEqual(isUpcomingConcert(null, referenceDate), false);
      assert.strictEqual(isUpcomingConcert({}, referenceDate), false);
    });
  });

  describe('filterUpcomingConcerts', () => {
    it('removes all past concerts and retains upcoming ones', () => {
      const sampleEvents = [
        { id: 1, title: 'Past Gig 1', date: '2026-11-01' },
        { id: 2, title: 'Past Gig 2', date: '2026-11-05' },
        { id: 3, title: 'Today Gig', date: '2026-11-06' },
        { id: 4, title: 'Upcoming 1', date: '2026-11-08' },
        { id: 5, title: 'Upcoming 2', date: '2026-12-15' }
      ];

      const upcoming = filterUpcomingConcerts(sampleEvents, referenceDate);
      assert.strictEqual(upcoming.length, 3);
      assert.deepStrictEqual(upcoming.map(e => e.id), [3, 4, 5]);
    });

    it('returns empty array if all concerts are in the past', () => {
      const pastEvents = [
        { id: 1, title: 'Past Gig', date: '2026-09-01' },
        { id: 2, title: 'Old Tour', date: '2026-10-20' }
      ];
      const result = filterUpcomingConcerts(pastEvents, referenceDate);
      assert.strictEqual(result.length, 0);
    });

    it('handles non-array inputs gracefully', () => {
      assert.deepStrictEqual(filterUpcomingConcerts(null), []);
      assert.deepStrictEqual(filterUpcomingConcerts(undefined), []);
    });
  });

  describe('sortConcertsAscending', () => {
    it('sorts concerts chronologically from earliest upcoming to latest', () => {
      const unsorted = [
        { id: 1, title: 'Far Future', date: '2027-01-10' },
        { id: 2, title: 'Near Future', date: '2026-11-08' },
        { id: 3, title: 'Mid Future', date: '2026-12-25' }
      ];

      const sorted = sortConcertsAscending(unsorted);
      assert.deepStrictEqual(sorted.map(e => e.id), [2, 3, 1]);
    });
  });

  describe('Concert Action Counters', () => {
    it('generates sanitized ticket booking counter ID', () => {
      const event = { title: 'Konkani Haribhajan & Classical Recital' };
      const id = `${sanitizeCounterId(event.title)}_book_ticket_counter`;
      assert.ok(id.length <= 40);
      assert.match(id, /^[a-z0-9_]+$/);
    });

    it('generates sanitized free entry interested counter ID', () => {
      const event = { title: 'Devotional Classical Recital 2026' };
      const id = `${sanitizeCounterId(event.title)}_interested_counter`;
      assert.ok(id.length <= 40);
      assert.match(id, /^[a-z0-9_]+$/);
    });
  });
});
