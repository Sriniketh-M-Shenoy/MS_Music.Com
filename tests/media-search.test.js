import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterMediaItems } from '../src/utils/mediaSearch.js';

describe('Media Search & Filter Feature: Videos, Shorts & Posts', () => {
  const sampleItems = [
    {
      id: 'v1',
      title: 'Kudajadriyil Kudakollum Mookambike Live',
      description: 'Devotional classic recorded at Kochi temple hall',
      type: 'Video',
      platform: 'YouTube',
      isYouTube: true,
      date: '2026-10-25'
    },
    {
      id: 's1',
      title: 'Bhavageethe Short Clip',
      description: 'Quick vocal snippet of classic Kannada poem',
      type: 'Short',
      platform: 'YouTube',
      isYouTube: true,
      date: '2026-10-26'
    },
    {
      id: 's2',
      title: 'Devotional Haribhajan Reel',
      description: 'Soulful evening bhajan performance',
      type: 'Short',
      platform: 'YouTube',
      isYouTube: true,
      date: '2026-10-20'
    },
    {
      id: 'p1',
      title: 'Instagram Tour Announcement',
      description: 'Sharing highlights from recent coastal Karnataka concerts',
      type: 'Post',
      platform: 'Instagram',
      isYouTube: false,
      date: '2026-10-18'
    }
  ];

  describe('Search Query Filtering', () => {
    it('returns all items when search query is empty', () => {
      const results = filterMediaItems(sampleItems, { filter: 'all', query: '' });
      assert.strictEqual(results.length, 4);
    });

    it('matches by title (case-insensitive)', () => {
      const results = filterMediaItems(sampleItems, { filter: 'all', query: 'kudajadriyil' });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'v1');
    });

    it('matches by description content', () => {
      const results = filterMediaItems(sampleItems, { filter: 'all', query: 'temple hall' });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 'v1');
    });

    it('matches across multiple items matching a keyword', () => {
      const results = filterMediaItems(sampleItems, { filter: 'all', query: 'devotional' });
      assert.strictEqual(results.length, 2);
      assert.deepStrictEqual(results.map(r => r.id), ['v1', 's2']);
    });

    it('returns empty array when query does not match anything', () => {
      const results = filterMediaItems(sampleItems, { filter: 'all', query: 'nonexistent-music-query' });
      assert.strictEqual(results.length, 0);
    });

    it('handles whitespace-only queries by returning all items', () => {
      const results = filterMediaItems(sampleItems, { filter: 'all', query: '    ' });
      assert.strictEqual(results.length, 4);
    });
  });

  describe('Tab Category Filtering', () => {
    it('filters only Videos when filter is "videos"', () => {
      const results = filterMediaItems(sampleItems, { filter: 'videos', query: '' });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].type, 'Video');
      assert.strictEqual(results[0].id, 'v1');
    });

    it('filters only Shorts when filter is "shorts"', () => {
      const results = filterMediaItems(sampleItems, { filter: 'shorts', query: '' });
      assert.strictEqual(results.length, 2);
      assert.ok(results.every(r => r.type === 'Short'));
    });

    it('filters only Socials when filter is "socials"', () => {
      const results = filterMediaItems(sampleItems, { filter: 'socials', query: '' });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].platform, 'Instagram');
    });
  });

  describe('Combined Category and Search Filtering', () => {
    it('narrows down within the active category tab', () => {
      const results = filterMediaItems(sampleItems, { filter: 'shorts', query: 'haribhajan' });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].id, 's2');
    });

    it('returns empty if search matches a video but filter is shorts', () => {
      const results = filterMediaItems(sampleItems, { filter: 'shorts', query: 'kudajadriyil' });
      assert.strictEqual(results.length, 0);
    });
  });
});
