import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_HANDLE,
  formatTimeAgo,
  extractVideoId,
  parseFeedItem,
  mergeMediaChronological
} from '../src/utils/dynamicYoutube.js';

describe('Dynamic YouTube Loader & Real-time Synchronizer', () => {
  it('has correct channel ID and handle constants', () => {
    assert.strictEqual(YOUTUBE_CHANNEL_ID, 'UCZZkLUPMv1Ka4bNSyOpYGOA');
    assert.strictEqual(YOUTUBE_CHANNEL_HANDLE, '@muralidharshenoykochi');
  });

  describe('formatTimeAgo', () => {
    it('returns "Just now" for dates within the last hour', () => {
      const now = new Date().toISOString();
      assert.strictEqual(formatTimeAgo(now), 'Just now');
    });

    it('returns formatted hours for earlier today', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 3600 * 1000).toISOString();
      assert.strictEqual(formatTimeAgo(fiveHoursAgo), '5h ago');
    });

    it('returns 1d ago for yesterday', () => {
      const yesterday = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
      assert.strictEqual(formatTimeAgo(yesterday), '1d ago');
    });

    it('returns formatted days for earlier this week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
      assert.strictEqual(formatTimeAgo(threeDaysAgo), '3d ago');
    });

    it('returns fallback for empty input', () => {
      assert.strictEqual(formatTimeAgo(''), 'Recent');
      assert.strictEqual(formatTimeAgo(null), 'Recent');
    });
  });

  describe('extractVideoId', () => {
    it('extracts videoId from direct videoId field', () => {
      assert.strictEqual(extractVideoId({ videoId: '_N5xbUMrAGM' }), '_N5xbUMrAGM');
    });

    it('extracts videoId from yt:video guid', () => {
      assert.strictEqual(extractVideoId({ guid: 'yt:video:_N5xbUMrAGM' }), '_N5xbUMrAGM');
    });

    it('extracts videoId from standard watch URL', () => {
      assert.strictEqual(
        extractVideoId({ link: 'https://www.youtube.com/watch?v=eP7v-PhzJm4' }),
        'eP7v-PhzJm4'
      );
    });

    it('extracts videoId from shorts URL', () => {
      assert.strictEqual(
        extractVideoId({ url: 'https://www.youtube.com/shorts/EoqjznpDRw0' }),
        'EoqjznpDRw0'
      );
    });

    it('returns null for invalid item', () => {
      assert.strictEqual(extractVideoId(null), null);
      assert.strictEqual(extractVideoId({}), null);
    });
  });

  describe('parseFeedItem', () => {
    it('correctly maps raw feed item into standard site schema', () => {
      const raw = {
        title: 'Ravi Varma Chitrathin | Raju Rahim (1978) | Muralidhar Shenoy Cover',
        pubDate: '2026-11-06 12:45:37',
        guid: 'yt:video:_N5xbUMrAGM',
        link: 'https://www.youtube.com/watch?v=_N5xbUMrAGM'
      };
      const parsed = parseFeedItem(raw);
      assert.ok(parsed);
      assert.strictEqual(parsed.id, 'yt-_N5xbUMrAGM');
      assert.strictEqual(parsed.videoId, '_N5xbUMrAGM');
      assert.strictEqual(parsed.date, '2026-11-06');
      assert.strictEqual(parsed.type, 'Video');
      assert.strictEqual(parsed.platform, 'YouTube');
      assert.strictEqual(parsed.thumbnail, 'https://i.ytimg.com/vi/_N5xbUMrAGM/hqdefault.jpg');
      assert.strictEqual(parsed.url, 'https://www.youtube.com/watch?v=_N5xbUMrAGM');
    });

    it('detects Short from title hashtag or short link', () => {
      const raw = {
        title: 'Classical Melody Cover #shorts',
        pubDate: '2026-11-06 15:00:00',
        guid: 'yt:video:abc12345678',
        link: 'https://www.youtube.com/shorts/abc12345678'
      };
      const parsed = parseFeedItem(raw);
      assert.ok(parsed);
      assert.strictEqual(parsed.type, 'Short');
      assert.strictEqual(parsed.url, 'https://www.youtube.com/shorts/abc12345678');
    });
  });

  describe('mergeMediaChronological', () => {
    it('merges new items at the top and preserves existing items', () => {
      const existing = [
        { id: 'yt-old1', videoId: 'old1', date: '2026-11-01', title: 'Older Song' },
        { id: 'custom-local', isCustom: true, date: '2026-11-04', title: 'Custom Upload' }
      ];
      const incoming = [
        { id: 'yt-new1', videoId: 'new1', date: '2026-11-06', title: 'Brand New Upload' }
      ];

      const merged = mergeMediaChronological(existing, incoming);
      assert.strictEqual(merged.length, 3);
      assert.strictEqual(merged[0].videoId, 'new1', 'Brand new item must be first');
      assert.strictEqual(merged[1].id, 'custom-local', 'Custom local upload must be preserved in date order');
      assert.strictEqual(merged[2].videoId, 'old1', 'Older item must be last');
    });

    it('deduplicates items with same videoId while updating metadata', () => {
      const existing = [
        { id: 'yt-vid1', videoId: 'vid1', date: '2026-11-01', title: 'Original Title', views: '200 views' }
      ];
      const incoming = [
        { id: 'yt-vid1', videoId: 'vid1', date: '2026-11-01', title: 'Updated Title', views: '250 views' }
      ];

      const merged = mergeMediaChronological(existing, incoming);
      assert.strictEqual(merged.length, 1);
      assert.strictEqual(merged[0].title, 'Updated Title');
      assert.strictEqual(merged[0].views, '200 views', 'Should preserve existing detailed view count');
    });
  });
});
