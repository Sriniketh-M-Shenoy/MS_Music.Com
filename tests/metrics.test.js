import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { 
  sanitizeCounterId, 
  getSongCounterId, 
  getVideoCounterId,
  API_KEY, 
  COUNTER_BASE_URL 
} from '../src/utils/metrics.js';

describe('Metrics Feature: Counter ID Sanitization & Tracking', () => {
  it('has valid API Ninjas config', () => {
    assert.ok(API_KEY && API_KEY.length > 10);
    assert.strictEqual(COUNTER_BASE_URL, 'https://api.api-ninjas.com/v1/counter');
  });

  describe('sanitizeCounterId', () => {
    it('returns default id when input is empty or null', () => {
      assert.strictEqual(sanitizeCounterId(''), 'counter_default');
      assert.strictEqual(sanitizeCounterId(null), 'counter_default');
      assert.strictEqual(sanitizeCounterId(undefined), 'counter_default');
    });

    it('replaces known alias names with exact shortened keys', () => {
      assert.strictEqual(sanitizeCounterId('total_book_ticket_clicks'), 'tot_book_tickets');
      assert.strictEqual(sanitizeCounterId('total_interested_clicks'), 'tot_interested');
      assert.strictEqual(sanitizeCounterId('social_clicks_youtube'), 'soc_click_yt');
      assert.strictEqual(sanitizeCounterId('social_clicks_facebook'), 'soc_click_fb');
      assert.strictEqual(sanitizeCounterId('social_clicks_instagram'), 'soc_click_insta');
      assert.strictEqual(sanitizeCounterId('social_clicks_spotify'), 'soc_click_spotify');
      assert.strictEqual(sanitizeCounterId('youtube_subscribe_clicks'), 'yt_sub_clicks');
    });

    it('strictly enforces maximum length of 20 characters for API Ninjas compatibility', () => {
      const longName = 'this_is_a_very_long_counter_name_that_exceeds_twenty_characters';
      const sanitized = sanitizeCounterId(longName);
      assert.ok(sanitized.length <= 20, `Length was ${sanitized.length}, expected <= 20`);
    });

    it('sanitizes special characters into underscores', () => {
      const dirty = 'Kudajadriyil @#& Kudakollum!! 2026';
      const sanitized = sanitizeCounterId(dirty);
      assert.match(sanitized, /^[a-z0-9_-]+$/);
      assert.ok(sanitized.length <= 20);
    });

    it('produces distinct hash identifiers for different long titles with common prefixes', () => {
      const id1 = sanitizeCounterId('devotional_morning_recital_part_one');
      const id2 = sanitizeCounterId('devotional_morning_recital_part_two');
      assert.ok(id1 !== id2, `Expected distinct IDs but got "${id1}" and "${id2}"`);
    });
  });

  describe('getVideoCounterId', () => {
    it('prefixes short media with "sh_"', () => {
      const shortMedia = {
        id: 'short-123',
        videoId: 'abc987xyz',
        type: 'Short',
        title: 'Bhavageethe Snippet'
      };
      const counterId = getVideoCounterId(shortMedia);
      assert.ok(counterId.startsWith('sh_'));
      assert.ok(counterId.length <= 20);
    });

    it('prefixes video media with "vd_"', () => {
      const fullVideo = {
        id: 'vid-456',
        videoId: 'videoXYZ123',
        type: 'Video',
        title: 'Full Devotional Bhajan Concert Live'
      };
      const counterId = getVideoCounterId(fullVideo);
      assert.ok(counterId.startsWith('vd_'));
      assert.ok(counterId.length <= 20);
    });

    it('falls back safely for null video', () => {
      assert.strictEqual(getVideoCounterId(null), 'mv_unknown');
    });
  });

  describe('getSongCounterId', () => {
    it('prefixes song plays and stays within 20 chars', () => {
      const songId = getSongCounterId('Kudajadriyil Kudakollum');
      assert.ok(songId.length <= 20);
      assert.match(songId, /^[a-z0-9_-]+$/);
    });

    it('handles track object as well as string', () => {
      const fromObj = getSongCounterId({ title: 'Ganesha Stotram' });
      const fromStr = getSongCounterId('Ganesha Stotram');
      assert.strictEqual(fromObj, fromStr);
    });

    it('returns sp_default for null or empty input', () => {
      assert.strictEqual(getSongCounterId(null), 'sp_default');
    });
  });
});
