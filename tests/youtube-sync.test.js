import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseRelativeTime, sortMediaChronological } from '../scripts/sync-youtube.js';
import { videosContent } from '../src/content/videos.js';

describe('YouTube Sync Feature: Video/Short Ingestion, Chronological Ordering & Custom Uploads', () => {
  describe('parseRelativeTime', () => {
    it('returns valid YYYY-MM-DD for empty or null time', () => {
      const today = new Date().toISOString().split('T')[0];
      assert.strictEqual(parseRelativeTime(''), today);
      assert.strictEqual(parseRelativeTime(null), today);
    });

    it('correctly calculates approximate dates from relative expressions', () => {
      const parsedDays = parseRelativeTime('3 days ago');
      assert.match(parsedDays, /^\d{4}-\d{2}-\d{2}$/);

      const parsedWeeks = parseRelativeTime('2 weeks ago');
      assert.match(parsedWeeks, /^\d{4}-\d{2}-\d{2}$/);

      const parsedMonths = parseRelativeTime('4 months ago');
      assert.match(parsedMonths, /^\d{4}-\d{2}-\d{2}$/);

      // Verify ordering: 3 days ago should be newer than 2 weeks ago, which is newer than 4 months ago
      assert.ok(new Date(parsedDays).getTime() > new Date(parsedWeeks).getTime());
      assert.ok(new Date(parsedWeeks).getTime() > new Date(parsedMonths).getTime());
    });
  });

  describe('sortMediaChronological', () => {
    it('sorts mixed videos and shorts strictly by date descending (newest first)', () => {
      const mockItems = [
        { id: 'item-old', title: 'Old Video', date: '2025-01-15', type: 'Video' },
        { id: 'item-newest', title: 'Newest Short', date: '2026-10-30', type: 'Short' },
        { id: 'item-mid', title: 'Mid Video', date: '2026-05-20', type: 'Video' }
      ];

      const sorted = sortMediaChronological(mockItems);
      assert.strictEqual(sorted[0].id, 'item-newest');
      assert.strictEqual(sorted[1].id, 'item-mid');
      assert.strictEqual(sorted[2].id, 'item-old');
    });

    it('correctly interleaves custom uploads in their exact chronological position', () => {
      const mixedWithCustom = [
        { id: 'yt-1', title: 'Channel Short', date: '2026-10-25', type: 'Short', isCustom: false },
        { id: 'custom-1', title: 'My Custom Live Recording', date: '2026-10-28', type: 'Video', isCustom: true },
        { id: 'yt-2', title: 'Channel Video', date: '2026-09-10', type: 'Video', isCustom: false }
      ];

      const sorted = sortMediaChronological(mixedWithCustom);
      assert.strictEqual(sorted[0].id, 'custom-1'); // Newest
      assert.strictEqual(sorted[1].id, 'yt-1');
      assert.strictEqual(sorted[2].id, 'yt-2');
    });
  });

  describe('Current Content Ingestion Integrity', () => {
    it('contains synced videos and shorts with valid schemas', () => {
      assert.ok(Array.isArray(videosContent));
      assert.ok(videosContent.length > 0, 'videosContent should not be empty');

      // Verify all items have valid structure
      for (const item of videosContent) {
        assert.ok(item.id, 'Every video/short must have an ID');
        assert.ok(item.title, `Item ${item.id} must have a title`);
        assert.ok(item.type === 'Video' || item.type === 'Short', `Invalid type for ${item.id}`);
        assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/, `Invalid date format for ${item.id}`);
      }
    });

    it('verifies that current videosContent is sorted chronologically descending', () => {
      for (let i = 0; i < videosContent.length - 1; i++) {
        const currentDate = new Date(videosContent[i].date).getTime();
        const nextDate = new Date(videosContent[i + 1].date).getTime();
        assert.ok(
          currentDate >= nextDate,
          `Sort order violation at index ${i}: ${videosContent[i].title} (${videosContent[i].date}) vs ${videosContent[i + 1].title} (${videosContent[i + 1].date})`
        );
      }
    });
  });
});
