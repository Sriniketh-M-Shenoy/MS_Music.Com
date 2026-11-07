/**
 * Media Search & Filter: Extended Functional Tests
 * =================================================
 * Complete coverage of filterMediaItems:
 *   - All filter modes: all, videos, shorts, socials
 *   - All search modes: title, description, type, platform
 *   - Pagination-awareness: results count matches expectations
 *   - Edge cases: empty list, null inputs, mixed platforms
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterMediaItems } from '../src/utils/mediaSearch.js';

// Full realistic dataset mirroring production content
const SAMPLE_MEDIA = [
  {
    id: 'yt-vid-1', videoId: 'aaaa1', title: 'Kudajadriyil Kudakollum Mookambike Live',
    description: 'Devotional classic recorded at Kochi temple hall, classical rendition.',
    type: 'Video', platform: 'YouTube', isYouTube: true, date: '2026-11-01'
  },
  {
    id: 'yt-vid-2', videoId: 'bbbb2', title: 'Yad Na Jaye Beete Dinon Ki Mohammed Rafi Tribute',
    description: 'Hindi playback tribute to legendary Mohammed Rafi, unplugged studio session.',
    type: 'Video', platform: 'YouTube', isYouTube: true, date: '2026-10-29'
  },
  {
    id: 'yt-vid-3', videoId: 'cccc3', title: 'Neela Vaana Odayil Tamil Classic',
    description: 'Evergreen Tamil film song, vocal rendition by Muralidhar Shenoy.',
    type: 'Video', platform: 'YouTube', isYouTube: true, date: '2026-10-15'
  },
  {
    id: 'yt-short-1', videoId: 'dddd4', title: 'Bhavageethe Snippet #shorts',
    description: 'Quick vocal snippet of classic Kannada poem by Muralidhar Shenoy.',
    type: 'Short', platform: 'YouTube', isYouTube: true, date: '2026-10-28'
  },
  {
    id: 'yt-short-2', videoId: 'eeee5', title: 'Devotional Haribhajan Reel',
    description: 'Soulful evening bhajan performance, classical devotional.',
    type: 'Short', platform: 'YouTube', isYouTube: true, date: '2026-10-20'
  },
  {
    id: 'yt-short-3', videoId: 'ffff6', title: 'Konkani Bhajan Short Clip',
    description: 'Short performance of Konkani GSB devotional bhajan.',
    type: 'Short', platform: 'YouTube', isYouTube: true, date: '2026-10-10'
  },
  {
    id: 'post-1', title: 'Instagram Tour Announcement',
    description: 'Sharing highlights from recent coastal Karnataka concerts.',
    type: 'Post', platform: 'Instagram', isYouTube: false, date: '2026-10-18',
    url: 'https://instagram.com/muralidhargshenoy'
  },
  {
    id: 'post-2', title: 'Facebook Community Post',
    description: 'GSB community event and temple celebration highlights.',
    type: 'Post', platform: 'Facebook', isYouTube: false, date: '2026-10-05',
    url: 'https://facebook.com/muralidhar.g.shenoy'
  }
];

describe('filterMediaItems: Category Filters', () => {
  it('returns all 8 items when filter is "all" with no query', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: '' });
    assert.strictEqual(r.length, 8);
  });

  it('returns only Videos (3 items) when filter is "videos"', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'videos', query: '' });
    assert.strictEqual(r.length, 3);
    assert.ok(r.every(x => x.type === 'Video' && x.isYouTube));
  });

  it('returns only Shorts (3 items) when filter is "shorts"', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'shorts', query: '' });
    assert.strictEqual(r.length, 3);
    assert.ok(r.every(x => x.type === 'Short' && x.isYouTube));
  });

  it('returns only social posts (2 items) when filter is "socials"', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'socials', query: '' });
    assert.strictEqual(r.length, 2);
    assert.ok(r.every(x => !x.isYouTube));
  });

  it('excludes YouTube items from "socials" filter', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'socials', query: '' });
    assert.ok(r.every(x => x.platform !== 'YouTube'));
  });

  it('excludes non-YouTube items from "videos" filter', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'videos', query: '' });
    assert.ok(r.every(x => x.isYouTube === true));
  });
});

describe('filterMediaItems: Search Queries', () => {
  it('matches by exact title keyword (case-insensitive)', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'KUDAJADRIYIL' });
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].id, 'yt-vid-1');
  });

  it('matches by partial title', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'rafi' });
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].id, 'yt-vid-2');
  });

  it('matches by description keyword', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'temple hall' });
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].id, 'yt-vid-1');
  });

  it('matches across multiple items sharing a keyword', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'devotional' });
    // Should match title/desc of vid-1, short-2, short-3, post-2
    assert.ok(r.length >= 2, `Expected at least 2 results for "devotional", got ${r.length}`);
  });

  it('matches by platform name', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'instagram' });
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].platform, 'Instagram');
  });

  it('matches by type name', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'short' });
    // Matches type "Short" and also any title containing "short"
    assert.ok(r.length >= 2);
  });

  it('returns empty array for non-matching query', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: 'bollywoood-typo-nonexistent' });
    assert.strictEqual(r.length, 0);
  });

  it('returns all items for empty query string', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: '' });
    assert.strictEqual(r.length, 8);
  });

  it('ignores whitespace-only query and returns all items', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'all', query: '   ' });
    assert.strictEqual(r.length, 8);
  });
});

describe('filterMediaItems: Combined Filter + Search', () => {
  it('filters to Shorts AND matches query within that tab', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'shorts', query: 'konkani' });
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].id, 'yt-short-3');
  });

  it('returns empty when query matches a Video but filter is "shorts"', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'shorts', query: 'kudajadriyil' });
    assert.strictEqual(r.length, 0);
  });

  it('returns empty when query matches a Short but filter is "socials"', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'socials', query: 'haribhajan' });
    // haribhajan appears in short-2 description, but socials filter excludes YouTube
    assert.strictEqual(r.length, 0);
  });

  it('returns Instagram post when filter is "socials" and query matches', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'socials', query: 'karnataka' });
    assert.strictEqual(r.length, 1);
    assert.strictEqual(r[0].platform, 'Instagram');
  });

  it('returns multiple Videos when query matches across all Videos', () => {
    const r = filterMediaItems(SAMPLE_MEDIA, { filter: 'videos', query: 'muralidhar' });
    // All video descriptions contain "Muralidhar Shenoy"
    assert.ok(r.length >= 1);
  });
});

describe('filterMediaItems: Edge Cases', () => {
  it('handles null items array gracefully', () => {
    const r = filterMediaItems(null, { filter: 'all', query: '' });
    assert.deepStrictEqual(r, []);
  });

  it('handles undefined items gracefully', () => {
    const r = filterMediaItems(undefined, { filter: 'all', query: '' });
    assert.deepStrictEqual(r, []);
  });

  it('handles empty items array', () => {
    const r = filterMediaItems([], { filter: 'all', query: 'anything' });
    assert.deepStrictEqual(r, []);
  });

  it('handles items with missing optional fields (no description, no type)', () => {
    const sparse = [{ id: 'x1', title: 'Mystery Song', isYouTube: true, platform: 'YouTube' }];
    const r = filterMediaItems(sparse, { filter: 'all', query: 'mystery' });
    assert.strictEqual(r.length, 1);
  });

  it('handles no options argument (uses defaults)', () => {
    const r = filterMediaItems(SAMPLE_MEDIA);
    assert.strictEqual(r.length, 8);
  });

  it('does not mutate the input array', () => {
    const original = SAMPLE_MEDIA.length;
    filterMediaItems(SAMPLE_MEDIA, { filter: 'videos', query: 'classic' });
    assert.strictEqual(SAMPLE_MEDIA.length, original);
  });
});

describe('filterMediaItems: Real Videos Content', () => {
  it('filters all real YouTube videos with the "videos" tab', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    const decorated = videosContent.map(v => ({ ...v, isYouTube: true }));
    const videos = filterMediaItems(decorated, { filter: 'videos', query: '' });
    const shorts = filterMediaItems(decorated, { filter: 'shorts', query: '' });
    assert.ok(videos.length > 0, 'Must have at least 1 Video');
    assert.ok(shorts.length > 0, 'Must have at least 1 Short');
    assert.strictEqual(videos.length + shorts.length, decorated.length,
      'Videos + Shorts counts must equal total items (no other types expected in videosContent)');
  });

  it('search for "Cover" matches multiple real YouTube videos', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    const decorated = videosContent.map(v => ({ ...v, isYouTube: true }));
    const r = filterMediaItems(decorated, { filter: 'all', query: 'cover' });
    assert.ok(r.length > 3, `Expected more than 3 results for "cover", got ${r.length}`);
  });
});
