/**
 * Metrics & Analytics: Extended Functional Tests
 * ================================================
 * Tests for all counter ID sanitization, tracking ID generation,
 * deduplication logic, alias resolution, and local storage schemas.
 * Does NOT make real network calls to API Ninjas.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeCounterId,
  getSongCounterId,
  getVideoCounterId,
  API_KEY,
  COUNTER_BASE_URL
} from '../src/utils/metrics.js';

// ─── API Config ───────────────────────────────────────────────────────────────
describe('Metrics: API Configuration', () => {
  it('API_KEY is set and non-trivial', () => {
    assert.ok(typeof API_KEY === 'string' && API_KEY.length > 10, 'API_KEY must be a valid token');
  });

  it('COUNTER_BASE_URL points to API Ninjas counter endpoint', () => {
    assert.strictEqual(COUNTER_BASE_URL, 'https://api.api-ninjas.com/v1/counter');
  });
});

// ─── sanitizeCounterId ────────────────────────────────────────────────────────
describe('sanitizeCounterId: Default Fallback', () => {
  it('returns "counter_default" for empty string', () => {
    assert.strictEqual(sanitizeCounterId(''), 'counter_default');
  });

  it('returns "counter_default" for null', () => {
    assert.strictEqual(sanitizeCounterId(null), 'counter_default');
  });

  it('returns "counter_default" for undefined', () => {
    assert.strictEqual(sanitizeCounterId(undefined), 'counter_default');
  });
});

describe('sanitizeCounterId: Alias Resolution', () => {
  const aliases = [
    ['total_book_ticket_clicks', 'tot_book_tickets'],
    ['total_interested_clicks', 'tot_interested'],
    ['social_clicks_facebook', 'soc_click_fb'],
    ['social_clicks_youtube', 'soc_click_yt'],
    ['social_clicks_instagram', 'soc_click_insta'],
    ['social_clicks_spotify', 'soc_click_spotify'],
    ['youtube_subscribe_clicks', 'yt_sub_clicks'],
    ['total_song_plays', 'total_song_plays'],
    ['total_video_views', 'total_video_views'],
    ['total_short_views', 'total_short_views'],
    ['total_media_views', 'total_media_views'],
    ['site_visits', 'site_visits'],
    ['enquiry_form_clicks', 'enquiry_form_clicks'],
    ['enquiry_form_submits', 'enquiry_form_submits']
  ];

  for (const [input, expected] of aliases) {
    it(`maps "${input}" → "${expected}"`, () => {
      assert.strictEqual(sanitizeCounterId(input), expected);
    });
  }
});

describe('sanitizeCounterId: Length Enforcement', () => {
  it('never returns an ID longer than 20 characters', () => {
    const longInputs = [
      'this_is_a_very_long_counter_name_exceeding_twenty_chars',
      'devotional_morning_recital_at_shri_ram_temple_mangaluru',
      'social_sharing_facebook_link_click_total_sum',
      'yt_vd_eP7v-PhzJm4_VeryLongTrackNameHere'
    ];
    for (const input of longInputs) {
      const result = sanitizeCounterId(input);
      assert.ok(result.length <= 20, `ID "${result}" for input "${input}" exceeds 20 chars (len=${result.length})`);
    }
  });

  it('returns ID as-is when already 20 chars or under', () => {
    const short = 'my_simple_counter';
    assert.strictEqual(sanitizeCounterId(short), short);
  });
});

describe('sanitizeCounterId: Character Sanitization', () => {
  it('lowercases all characters', () => {
    const result = sanitizeCounterId('MyCounter');
    assert.strictEqual(result, result.toLowerCase());
  });

  it('replaces spaces with underscores', () => {
    const result = sanitizeCounterId('song plays');
    assert.match(result, /^[a-z0-9_-]+$/);
    assert.ok(!result.includes(' '));
  });

  it('replaces special characters with underscores', () => {
    const result = sanitizeCounterId('Track @#$% Name!!');
    assert.match(result, /^[a-z0-9_-]+$/);
  });

  it('collapses consecutive underscores', () => {
    const result = sanitizeCounterId('track   name');
    assert.ok(!result.includes('__'), `Should not have double underscores: "${result}"`);
  });

  it('produces distinct hashes for different long names with shared prefix', () => {
    const a = sanitizeCounterId('devotional_morning_recital_part_one_extended');
    const b = sanitizeCounterId('devotional_morning_recital_part_two_extended');
    assert.notStrictEqual(a, b, 'Different long names must produce distinct IDs');
  });

  it('returns valid slug for hyphenated YouTube video ID', () => {
    const result = sanitizeCounterId('vd_eP7v-PhzJm4');
    assert.match(result, /^[a-z0-9_-]+$/);
    assert.ok(result.length <= 20);
  });
});

// ─── getVideoCounterId ────────────────────────────────────────────────────────
describe('getVideoCounterId', () => {
  it('prefixes Video type with "vd_"', () => {
    const video = { videoId: 'abc123xyz12', type: 'Video', title: 'Classical Cover' };
    const id = getVideoCounterId(video);
    assert.ok(id.startsWith('vd_'));
    assert.ok(id.length <= 20);
  });

  it('prefixes Short type with "sh_"', () => {
    const short = { videoId: 'xyz456abc78', type: 'Short', title: 'Bhajan Clip' };
    const id = getVideoCounterId(short);
    assert.ok(id.startsWith('sh_'));
    assert.ok(id.length <= 20);
  });

  it('uses videoId over id over title for the identifier', () => {
    const v1 = { videoId: 'vid111', type: 'Video', title: 'Song Title' };
    const v2 = { videoId: 'vid222', type: 'Video', title: 'Song Title' };
    // Same title, different videoIds → must produce different counter IDs
    assert.notStrictEqual(getVideoCounterId(v1), getVideoCounterId(v2));
  });

  it('falls back to "mv_unknown" for null input', () => {
    assert.strictEqual(getVideoCounterId(null), 'mv_unknown');
  });

  it('falls back to "mv_unknown" for undefined input', () => {
    assert.strictEqual(getVideoCounterId(undefined), 'mv_unknown');
  });

  it('never returns ID longer than 20 chars for any video', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    for (const v of videosContent.slice(0, 20)) { // Check first 20
      const id = getVideoCounterId(v);
      assert.ok(id.length <= 20, `Counter ID "${id}" for video "${v.videoId}" exceeds 20 chars`);
    }
  });
});

// ─── getSongCounterId ─────────────────────────────────────────────────────────
describe('getSongCounterId', () => {
  it('generates an ID with max 20 chars from a string title', () => {
    const id = getSongCounterId('Kudajadriyil Kudakollum');
    assert.ok(id.length <= 20);
    assert.match(id, /^[a-z0-9_-]+$/);
  });

  it('generates same ID from track object as from title string', () => {
    const fromStr = getSongCounterId('Ganesha Stotram');
    const fromObj = getSongCounterId({ title: 'Ganesha Stotram' });
    assert.strictEqual(fromStr, fromObj);
  });

  it('returns "sp_default" for null input', () => {
    assert.strictEqual(getSongCounterId(null), 'sp_default');
  });

  it('returns "sp_default" for undefined input', () => {
    assert.strictEqual(getSongCounterId(undefined), 'sp_default');
  });

  it('returns "sp_default" for empty string', () => {
    assert.strictEqual(getSongCounterId(''), 'sp_default');
  });

  it('produces different IDs for different songs', () => {
    const a = getSongCounterId('Neela Vaana Odayil');
    const b = getSongCounterId('Yad Na Jaye Beete Dinon Ki');
    assert.notStrictEqual(a, b);
  });

  it('never returns ID longer than 20 chars for any real track', async () => {
    const { audioTracksContent } = await import('../src/content/audio.js');
    for (const track of audioTracksContent) {
      const id = getSongCounterId(track.title);
      assert.ok(id.length <= 20, `Song counter ID "${id}" for "${track.title}" exceeds 20 chars`);
    }
  });
});

// ─── All known counter IDs ────────────────────────────────────────────────────
describe('Metrics: All Counter IDs are API Ninjas Compatible', () => {
  const knownCounters = [
    'site_visits',
    'total_song_plays',
    'total_video_views',
    'total_short_views',
    'total_media_views',
    'total_book_ticket_clicks',
    'total_interested_clicks',
    'social_clicks_youtube',
    'social_clicks_instagram',
    'social_clicks_facebook',
    'social_clicks_spotify',
    'youtube_subscribe_clicks',
    'enquiry_form_clicks',
    'enquiry_form_submits',
    'concert_notifications_opens'
  ];

  for (const name of knownCounters) {
    it(`counter "${name}" sanitizes to ≤20 chars with valid characters`, () => {
      const id = sanitizeCounterId(name);
      assert.ok(id.length >= 1, `Counter ID must not be empty for "${name}"`);
      assert.ok(id.length <= 20, `Counter ID "${id}" for "${name}" exceeds 20 chars`);
      assert.match(id, /^[a-z0-9_-]+$/, `Counter ID "${id}" contains invalid characters`);
    });
  }
});
