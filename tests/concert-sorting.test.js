import test from 'node:test';
import assert from 'node:assert';
import { parseConcertDate, formatConcertDate, sortConcertsAscending, filterUpcomingConcerts, getEventDate } from '../src/utils/concerts.js';
import { eventsContent } from '../src/content/events.js';

test('Concert Sorting & Date Utilities', async (t) => {
  await t.test('parses various date formats correctly', () => {
    const d1 = parseConcertDate('2026-11-08');
    assert.strictEqual(d1.getFullYear(), 2026);
    assert.strictEqual(d1.getMonth(), 10); // Nov (0-indexed)
    assert.strictEqual(d1.getDate(), 8);

    const d2 = parseConcertDate('DEC 20, 2026');
    assert.strictEqual(d2.getFullYear(), 2026);
    assert.strictEqual(d2.getMonth(), 11); // Dec
    assert.strictEqual(d2.getDate(), 20);

    const d3 = parseConcertDate('DEC 21 2026');
    assert.strictEqual(d3.getFullYear(), 2026);
    assert.strictEqual(d3.getMonth(), 11); // Dec
    assert.strictEqual(d3.getDate(), 21);
  });

  await t.test('formats dates consistently to MMM DD, YYYY', () => {
    assert.strictEqual(formatConcertDate('2026-11-08'), 'NOV 08, 2026');
    assert.strictEqual(formatConcertDate('2026-12-20'), 'DEC 20, 2026');
  });

  await t.test('sorts concerts in ascending chronological order (earliest first)', () => {
    const unordered = [
      { id: 1, title: 'Dec 21 Concert', date: '2026-12-21', formattedDate: 'DEC 21, 2026' },
      { id: 2, title: 'Nov 8 Concert', date: '2026-11-08', formattedDate: 'NOV 08, 2026' },
      { id: 3, title: 'Dec 20 Concert', date: '2026-12-20', formattedDate: 'DEC 20, 2026' }
    ];

    const sorted = sortConcertsAscending(unordered);
    assert.strictEqual(sorted[0].title, 'Nov 8 Concert');
    assert.strictEqual(sorted[1].title, 'Dec 20 Concert');
    assert.strictEqual(sorted[2].title, 'Dec 21 Concert');
  });

  await t.test('prefers visibly displayed formattedDate when sorting mismatched dates', () => {
    const mismatched = [
      { id: 1, title: 'Shown as Dec 20', date: '2026-11-06', formattedDate: 'DEC 20, 2026' },
      { id: 2, title: 'Shown as Nov 8', date: '2026-11-08', formattedDate: 'NOV 08, 2026' }
    ];

    const sorted = sortConcertsAscending(mismatched);
    assert.strictEqual(sorted[0].title, 'Shown as Nov 8');
    assert.strictEqual(sorted[1].title, 'Shown as Dec 20');
  });

  await t.test('live eventsContent in site is strictly sorted in chronological order', () => {
    const active = sortConcertsAscending(filterUpcomingConcerts(eventsContent));
    for (let i = 0; i < active.length - 1; i++) {
      const current = getEventDate(active[i]).getTime();
      const next = getEventDate(active[i + 1]).getTime();
      assert.ok(current <= next, `Event at ${i} is not before or equal to event at ${i + 1}`);
    }
  });
});
