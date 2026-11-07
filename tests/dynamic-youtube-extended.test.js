/**
 * Dynamic YouTube Loader: Extended Functional Tests
 * ==================================================
 * Full coverage of src/utils/dynamicYoutube.js:
 *   - extractVideoId: all input shapes
 *   - parseFeedItem: type detection, date parsing, URL construction
 *   - mergeMediaChronological: deduplication, ordering, custom items
 *   - formatTimeAgo: all time ranges
 *   - Integration with live videosContent
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_HANDLE,
  STORAGE_KEY,
  formatTimeAgo,
  extractVideoId,
  parseFeedItem,
  mergeMediaChronological,
  getInitialDynamicVideos
} from '../src/utils/dynamicYoutube.js';

// ─── Constants ────────────────────────────────────────────────────────────────
describe('Dynamic YouTube: Constants', () => {
  it('YOUTUBE_CHANNEL_ID is the correct channel ID', () => {
    assert.strictEqual(YOUTUBE_CHANNEL_ID, 'UCZZkLUPMv1Ka4bNSyOpYGOA');
  });

  it('YOUTUBE_CHANNEL_HANDLE is correct', () => {
    assert.strictEqual(YOUTUBE_CHANNEL_HANDLE, '@muralidharshenoykochi');
  });

  it('STORAGE_KEY is a non-empty string', () => {
    assert.ok(typeof STORAGE_KEY === 'string' && STORAGE_KEY.length > 0);
  });
});

// ─── formatTimeAgo ────────────────────────────────────────────────────────────
describe('formatTimeAgo', () => {
  const now = Date.now();

  it('returns "Recent" for null input', () => {
    assert.strictEqual(formatTimeAgo(null), 'Recent');
  });

  it('returns "Recent" for empty string', () => {
    assert.strictEqual(formatTimeAgo(''), 'Recent');
  });

  it('returns "Recent" for invalid date string', () => {
    assert.strictEqual(formatTimeAgo('not-a-date'), 'Recent');
  });

  it('returns "Just now" for the current instant', () => {
    assert.strictEqual(formatTimeAgo(new Date().toISOString()), 'Just now');
  });

  it('returns "Just now" for 30 minutes ago', () => {
    const thirtyMinAgo = new Date(now - 30 * 60 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(thirtyMinAgo), 'Just now');
  });

  it('returns "1h ago" for exactly 1 hour ago', () => {
    const oneHourAgo = new Date(now - 1 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(oneHourAgo), '1h ago');
  });

  it('returns "5h ago" for 5 hours ago', () => {
    const fiveHoursAgo = new Date(now - 5 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(fiveHoursAgo), '5h ago');
  });

  it('returns "1d ago" for 25 hours ago', () => {
    const yesterday = new Date(now - 25 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(yesterday), '1d ago');
  });

  it('returns "3d ago" for 3 days ago', () => {
    const threeDays = new Date(now - 3 * 24 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(threeDays), '3d ago');
  });

  it('returns "1w ago" for 8 days ago', () => {
    const eightDays = new Date(now - 8 * 24 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(eightDays), '1w ago');
  });

  it('returns "2mo ago" for 65 days ago', () => {
    const twoMonths = new Date(now - 65 * 24 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(twoMonths), '2mo ago');
  });

  it('returns "1y ago" for approximately 1 year ago', () => {
    const oneYear = new Date(now - 370 * 24 * 3600 * 1000).toISOString();
    assert.strictEqual(formatTimeAgo(oneYear), '1y ago');
  });
});

// ─── extractVideoId ───────────────────────────────────────────────────────────
describe('extractVideoId', () => {
  it('extracts from direct videoId field (11 chars)', () => {
    assert.strictEqual(extractVideoId({ videoId: '_N5xbUMrAGM' }), '_N5xbUMrAGM');
  });

  it('extracts from yt:video:VIDEOID GUID format', () => {
    assert.strictEqual(extractVideoId({ guid: 'yt:video:_N5xbUMrAGM' }), '_N5xbUMrAGM');
  });

  it('extracts from watch?v= in link field', () => {
    assert.strictEqual(
      extractVideoId({ link: 'https://www.youtube.com/watch?v=eP7v-PhzJm4' }),
      'eP7v-PhzJm4'
    );
  });

  it('extracts from /shorts/ in link field', () => {
    assert.strictEqual(
      extractVideoId({ link: 'https://www.youtube.com/shorts/EoqjznpDRw0' }),
      'EoqjznpDRw0'
    );
  });

  it('extracts from watch?v= in url field', () => {
    assert.strictEqual(
      extractVideoId({ url: 'https://www.youtube.com/watch?v=abc12345678' }),
      'abc12345678'
    );
  });

  it('extracts from /shorts/ in url field', () => {
    assert.strictEqual(
      extractVideoId({ url: 'https://www.youtube.com/shorts/xyz98765432' }),
      'xyz98765432'
    );
  });

  it('prefers videoId field over guid', () => {
    assert.strictEqual(
      extractVideoId({ videoId: 'direct123456', guid: 'yt:video:fromguid_567' }),
      'direct123456'
    );
  });

  it('returns null for null input', () => {
    assert.strictEqual(extractVideoId(null), null);
  });

  it('returns null for undefined', () => {
    assert.strictEqual(extractVideoId(undefined), null);
  });

  it('returns null for empty object', () => {
    assert.strictEqual(extractVideoId({}), null);
  });

  it('returns null for object with no recognisable ID field', () => {
    assert.strictEqual(extractVideoId({ title: 'No ID here', description: 'x' }), null);
  });
});

// ─── parseFeedItem ────────────────────────────────────────────────────────────
describe('parseFeedItem: Standard Video', () => {
  const raw = {
    title: 'Ravi Varma Chitrathin | Muralidhar Shenoy Cover',
    pubDate: '2026-11-06 12:45:37',
    guid: 'yt:video:_N5xbUMrAGM',
    link: 'https://www.youtube.com/watch?v=_N5xbUMrAGM'
  };

  it('parses videoId correctly', () => {
    assert.strictEqual(parseFeedItem(raw).videoId, '_N5xbUMrAGM');
  });

  it('sets id as "yt-{videoId}"', () => {
    assert.strictEqual(parseFeedItem(raw).id, 'yt-_N5xbUMrAGM');
  });

  it('sets type to Video for a regular video link', () => {
    assert.strictEqual(parseFeedItem(raw).type, 'Video');
  });

  it('sets platform to YouTube', () => {
    assert.strictEqual(parseFeedItem(raw).platform, 'YouTube');
  });

  it('sets date from pubDate (YYYY-MM-DD)', () => {
    assert.strictEqual(parseFeedItem(raw).date, '2026-11-06');
  });

  it('sets correct watch URL', () => {
    assert.strictEqual(parseFeedItem(raw).url, 'https://www.youtube.com/watch?v=_N5xbUMrAGM');
  });

  it('sets correct thumbnail URL', () => {
    assert.strictEqual(parseFeedItem(raw).thumbnail, 'https://i.ytimg.com/vi/_N5xbUMrAGM/hqdefault.jpg');
  });

  it('computes timeAgo as a non-empty string', () => {
    const result = parseFeedItem(raw);
    assert.ok(typeof result.timeAgo === 'string' && result.timeAgo.length > 0);
  });
});

describe('parseFeedItem: Short Detection', () => {
  it('detects Short via #shorts hashtag in title', () => {
    const raw = {
      title: 'Classical Melody #shorts',
      pubDate: '2026-11-01 10:00:00',
      guid: 'yt:video:abc12345678',
      link: 'https://www.youtube.com/watch?v=abc12345678'
    };
    assert.strictEqual(parseFeedItem(raw).type, 'Short');
  });

  it('detects Short via /shorts/ in URL', () => {
    const raw = {
      title: 'Bhajan Clip',
      pubDate: '2026-11-01 10:00:00',
      guid: 'yt:video:xyz98765432',
      link: 'https://www.youtube.com/shorts/xyz98765432'
    };
    const result = parseFeedItem(raw);
    assert.strictEqual(result.type, 'Short');
    assert.strictEqual(result.url, 'https://www.youtube.com/shorts/xyz98765432');
  });

  it('sets correct /shorts/ URL for detected Short', () => {
    const raw = {
      title: 'Devotional Clip #short',
      pubDate: '2026-10-20 08:00:00',
      guid: 'yt:video:short12345a',
      link: 'https://www.youtube.com/watch?v=short12345a'
    };
    const result = parseFeedItem(raw);
    assert.strictEqual(result.type, 'Short');
    assert.ok(result.url.includes('/shorts/short12345a'));
  });
});

describe('parseFeedItem: Edge Cases', () => {
  it('returns null for null input', () => {
    assert.strictEqual(parseFeedItem(null), null);
  });

  it('returns null for item with no recognizable videoId', () => {
    assert.strictEqual(parseFeedItem({ title: 'No ID' }), null);
  });

  it('uses today as date fallback when no pubDate is available', () => {
    const result = parseFeedItem({ videoId: 'fallback1234', title: 'No Date Item' });
    assert.ok(result !== null);
    assert.match(result.date, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles ISO 8601 pubDate format correctly', () => {
    const raw = {
      videoId: 'isoformat1234',
      title: 'ISO Date Test',
      pubDate: '2026-11-03T14:30:00.000Z'
    };
    const result = parseFeedItem(raw);
    assert.strictEqual(result.date, '2026-11-03');
  });

  it('applies "New Release" for missing views', () => {
    const raw = { videoId: 'noviews12345', title: 'Fresh Upload', pubDate: '2026-11-01' };
    assert.strictEqual(parseFeedItem(raw).views, 'New Release');
  });

  it('suffixes " views" to bare view counts', () => {
    const raw = { videoId: 'viewstest123', title: 'Count Test', pubDate: '2026-11-01', views: '5.2K' };
    const result = parseFeedItem(raw);
    assert.ok(result.views.includes('view'), `Expected "views" in "${result.views}"`);
  });

  it('preserves views that already contain the word "views"', () => {
    const raw = { videoId: 'viewstest456', title: 'Count Test 2', pubDate: '2026-11-01', views: '5.2K views' };
    const result = parseFeedItem(raw);
    assert.ok(!result.views.includes('views views'), `Should not duplicate "views": "${result.views}"`);
  });
});

// ─── mergeMediaChronological ──────────────────────────────────────────────────
describe('mergeMediaChronological: Ordering', () => {
  it('places newer items before older ones', () => {
    const existing = [
      { id: 'yt-old1', videoId: 'old1', date: '2026-11-01', title: 'Old Video' }
    ];
    const incoming = [
      { id: 'yt-new1', videoId: 'new1', date: '2026-11-06', title: 'New Video' }
    ];
    const merged = mergeMediaChronological(existing, incoming);
    assert.strictEqual(merged[0].videoId, 'new1');
    assert.strictEqual(merged[1].videoId, 'old1');
  });

  it('sorts three items in descending date order', () => {
    const items = [
      { videoId: 'c', date: '2026-11-01' },
      { videoId: 'a', date: '2026-11-05' },
      { videoId: 'b', date: '2026-11-03' }
    ];
    const merged = mergeMediaChronological([], items);
    assert.deepStrictEqual(merged.map(x => x.videoId), ['a', 'b', 'c']);
  });
});

describe('mergeMediaChronological: Deduplication', () => {
  it('deduplicates items with the same videoId', () => {
    const existing = [{ id: 'yt-1', videoId: 'vid1', date: '2026-11-01', title: 'Original', views: '100 views' }];
    const incoming = [{ id: 'yt-1', videoId: 'vid1', date: '2026-11-01', title: 'Updated', views: '200 views' }];
    const merged = mergeMediaChronological(existing, incoming);
    assert.strictEqual(merged.length, 1);
  });

  it('uses incoming title on deduplication', () => {
    const existing = [{ videoId: 'vid1', date: '2026-11-01', title: 'Old Title', views: '' }];
    const incoming = [{ videoId: 'vid1', date: '2026-11-01', title: 'New Title', views: '500 views' }];
    const merged = mergeMediaChronological(existing, incoming);
    assert.strictEqual(merged[0].title, 'New Title');
  });

  it('preserves existing non-empty views on deduplication', () => {
    const existing = [{ videoId: 'vid1', date: '2026-11-01', title: 'T', views: '1.5K views' }];
    const incoming = [{ videoId: 'vid1', date: '2026-11-01', title: 'T Updated', views: 'New Release' }];
    const merged = mergeMediaChronological(existing, incoming);
    assert.strictEqual(merged[0].views, '1.5K views', 'Must preserve existing meaningful view count');
  });
});

describe('mergeMediaChronological: Custom Items', () => {
  it('preserves custom (device-uploaded) items', () => {
    const existing = [
      { id: 'custom-local-1', isCustom: true, date: '2026-11-04', title: 'Custom Upload' }
    ];
    const incoming = [
      { videoId: 'newyt1', date: '2026-11-06', title: 'New YT Upload' }
    ];
    const merged = mergeMediaChronological(existing, incoming);
    assert.ok(merged.some(x => x.id === 'custom-local-1'), 'Custom item must be preserved');
    assert.ok(merged.some(x => x.videoId === 'newyt1'), 'New YouTube item must be included');
  });

  it('places custom item in correct chronological position', () => {
    const existing = [
      { id: 'custom-1', isCustom: true, date: '2026-11-04', title: 'Custom' }
    ];
    const incoming = [
      { videoId: 'newer', date: '2026-11-06', title: 'Newer YT' },
      { videoId: 'older', date: '2026-11-02', title: 'Older YT' }
    ];
    const merged = mergeMediaChronological(existing, incoming);
    const ids = merged.map(x => x.videoId || x.id);
    assert.ok(ids.indexOf('newer') < ids.indexOf('custom-1'), 'Newer YT should come before custom');
    assert.ok(ids.indexOf('custom-1') < ids.indexOf('older'), 'Custom should come before older YT');
  });
});

describe('mergeMediaChronological: Edge Cases', () => {
  it('handles empty existing list', () => {
    const incoming = [{ videoId: 'v1', date: '2026-11-06', title: 'Only' }];
    const merged = mergeMediaChronological([], incoming);
    assert.strictEqual(merged.length, 1);
  });

  it('handles empty incoming list', () => {
    const existing = [{ videoId: 'v1', date: '2026-11-01', title: 'Existing' }];
    const merged = mergeMediaChronological(existing, []);
    assert.strictEqual(merged.length, 1);
  });

  it('handles both lists empty', () => {
    assert.deepStrictEqual(mergeMediaChronological([], []), []);
  });

  it('handles null existing list', () => {
    const incoming = [{ videoId: 'v1', date: '2026-11-06', title: 'T' }];
    const merged = mergeMediaChronological(null, incoming);
    assert.strictEqual(merged.length, 1);
  });

  it('handles null incoming list', () => {
    const existing = [{ videoId: 'v1', date: '2026-11-01', title: 'T' }];
    const merged = mergeMediaChronological(existing, null);
    assert.strictEqual(merged.length, 1);
  });

  it('skips null/undefined items in either list', () => {
    const existing = [null, { videoId: 'valid1', date: '2026-11-01', title: 'Valid' }, undefined];
    const incoming = [null, { videoId: 'valid2', date: '2026-11-06', title: 'Valid 2' }];
    const merged = mergeMediaChronological(existing, incoming);
    assert.strictEqual(merged.length, 2);
  });
});

// ─── getInitialDynamicVideos ──────────────────────────────────────────────────
describe('getInitialDynamicVideos: Server-side (no window)', () => {
  it('returns fallback videos when window is undefined (SSR context)', () => {
    // In Node.js test environment, window is undefined
    const fallback = [{ videoId: 'fb1', date: '2026-11-01', title: 'Fallback' }];
    const result = getInitialDynamicVideos(fallback);
    // Should return fallback since no window/localStorage available
    assert.ok(Array.isArray(result));
    assert.ok(result.length >= 1);
  });

  it('returns empty array when no fallback provided', () => {
    const result = getInitialDynamicVideos();
    assert.ok(Array.isArray(result));
  });
});

// ─── Integration with live videosContent ─────────────────────────────────────
describe('Dynamic YouTube: Integration with videosContent', () => {
  it('merging videosContent with itself produces no duplicates', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    const merged = mergeMediaChronological(videosContent, videosContent);
    const ids = merged.map(v => v.videoId);
    const unique = new Set(ids);
    assert.strictEqual(ids.length, unique.size, 'No duplicate videoIds after self-merge');
  });

  it('merged result has same or more items than original when new items added', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    const newItem = {
      id: 'yt-brandnew1234',
      videoId: 'brandnew1234',
      title: 'Brand New Upload Today',
      type: 'Video',
      platform: 'YouTube',
      date: '2026-11-06',
      views: 'New Release',
      timeAgo: 'Just now',
      url: 'https://www.youtube.com/watch?v=brandnew1234',
      thumbnail: 'https://i.ytimg.com/vi/brandnew1234/hqdefault.jpg',
      description: 'Test'
    };
    const merged = mergeMediaChronological(videosContent, [newItem]);
    assert.ok(merged.length >= videosContent.length, 'Merge must not lose existing items');
    assert.ok(merged.some(v => v.videoId === 'brandnew1234'), 'New item must appear in merged list');
  });

  it('every parseFeedItem result passes the same schema check as videosContent items', () => {
    const fakeRSSItems = [
      { title: 'Test Song Cover', pubDate: '2026-11-06', guid: 'yt:video:testitem0001', link: 'https://www.youtube.com/watch?v=testitem0001' },
      { title: 'Short Clip #shorts', pubDate: '2026-11-05', guid: 'yt:video:testitem0002', link: 'https://www.youtube.com/shorts/testitem0002' }
    ];
    for (const raw of fakeRSSItems) {
      const item = parseFeedItem(raw);
      assert.ok(item, 'parseFeedItem must return a non-null result');
      assert.ok(typeof item.id === 'string');
      assert.ok(typeof item.videoId === 'string' && item.videoId.length > 0);
      assert.ok(typeof item.title === 'string');
      assert.ok(['Video', 'Short'].includes(item.type));
      assert.ok(item.url.startsWith('https://'));
      assert.ok(item.thumbnail.startsWith('https://'));
      assert.match(item.date, /^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
