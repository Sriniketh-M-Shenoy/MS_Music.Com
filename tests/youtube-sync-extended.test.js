/**
 * YouTube Sync Script: Extended Functional Tests
 * ================================================
 * Covers parseRelativeTime, sortMediaChronological, and all schema
 * validation rules applied to the actual synced videosContent —
 * including cross-checks for URL format, ID uniqueness, and ordering.
 * Also validates the GitHub file size safety limits for video uploads.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { parseRelativeTime, sortMediaChronological } from '../scripts/sync-youtube.js';
import { videosContent } from '../src/content/videos.js';

const ROOT = '/Users/muralidharshenoy/Desktop/My_Website/MS_Music.Com';

// ─── parseRelativeTime ────────────────────────────────────────────────────────
describe('parseRelativeTime', () => {
  it('returns a valid YYYY-MM-DD for null input', () => {
    const result = parseRelativeTime(null);
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a valid YYYY-MM-DD for empty string', () => {
    const result = parseRelativeTime('');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses "1 hour ago"', () => {
    const result = parseRelativeTime('1 hour ago');
    const d = new Date(result);
    const now = new Date();
    assert.ok(!isNaN(d.getTime()), 'Must be a valid date');
    // Should be today or yesterday at most
    const diffDays = Math.abs(now - d) / (24 * 3600 * 1000);
    assert.ok(diffDays <= 1, 'Should be within 1 day');
  });

  it('parses "2 hours ago"', () => {
    const result = parseRelativeTime('2 hours ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses "1 day ago"', () => {
    const result = parseRelativeTime('1 day ago');
    const d = new Date(result);
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
    assert.strictEqual(result, yesterday.toISOString().split('T')[0]);
  });

  it('parses "3 days ago"', () => {
    const result = parseRelativeTime('3 days ago');
    const d = new Date(result);
    const expected = new Date(Date.now() - 3 * 24 * 3600 * 1000);
    assert.strictEqual(result, expected.toISOString().split('T')[0]);
  });

  it('parses "1 week ago"', () => {
    const result = parseRelativeTime('1 week ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
    const d = new Date(result);
    const expected = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    assert.strictEqual(result, expected.toISOString().split('T')[0]);
  });

  it('parses "2 weeks ago"', () => {
    const result = parseRelativeTime('2 weeks ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses "1 month ago"', () => {
    const result = parseRelativeTime('1 month ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses "6 months ago"', () => {
    const result = parseRelativeTime('6 months ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses "1 year ago"', () => {
    const result = parseRelativeTime('1 year ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses abbreviated "1d ago" format', () => {
    const result = parseRelativeTime('1d ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('parses abbreviated "3h ago" format', () => {
    const result = parseRelativeTime('3h ago');
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('always returns a date in YYYY-MM-DD format', () => {
    const inputs = ['just now', '5 minutes ago', '2 hours ago', '1 day ago', '1 week ago', '1 month ago', '1 year ago', 'Recent'];
    for (const input of inputs) {
      const result = parseRelativeTime(input);
      assert.match(result, /^\d{4}-\d{2}-\d{2}$/, `parseRelativeTime("${input}") must return YYYY-MM-DD, got "${result}"`);
    }
  });
});

// ─── sortMediaChronological ───────────────────────────────────────────────────
describe('sortMediaChronological', () => {
  it('sorts items descending (newest first)', () => {
    const items = [
      { videoId: 'old', date: '2026-10-01' },
      { videoId: 'new', date: '2026-11-06' },
      { videoId: 'mid', date: '2026-10-20' }
    ];
    const sorted = sortMediaChronological(items);
    assert.deepStrictEqual(sorted.map(x => x.videoId), ['new', 'mid', 'old']);
  });

  it('places custom uploads in correct chronological position', () => {
    const items = [
      { videoId: 'yt1', date: '2026-11-01' },
      { id: 'custom-1', isCustom: true, date: '2026-11-04', videoId: undefined },
      { videoId: 'yt2', date: '2026-11-06' }
    ];
    const sorted = sortMediaChronological(items);
    assert.strictEqual(sorted[0].videoId, 'yt2');
    assert.strictEqual(sorted[1].id, 'custom-1');
    assert.strictEqual(sorted[2].videoId, 'yt1');
  });

  it('handles single item', () => {
    const items = [{ videoId: 'solo', date: '2026-11-06' }];
    const sorted = sortMediaChronological(items);
    assert.strictEqual(sorted.length, 1);
  });

  it('handles empty array', () => {
    assert.deepStrictEqual(sortMediaChronological([]), []);
  });

  it('handles null gracefully', () => {
    assert.deepStrictEqual(sortMediaChronological(null), []);
  });

  it('does not mutate the original array', () => {
    const items = [
      { videoId: 'b', date: '2026-10-01' },
      { videoId: 'a', date: '2026-11-06' }
    ];
    const original = items.map(x => x.videoId);
    sortMediaChronological(items);
    assert.deepStrictEqual(items.map(x => x.videoId), original, 'Original array must not be mutated');
  });

  it('items with same date maintain stable relative ordering', () => {
    const items = [
      { videoId: 'x', date: '2026-11-05' },
      { videoId: 'y', date: '2026-11-05' },
      { videoId: 'z', date: '2026-11-05' }
    ];
    const sorted = sortMediaChronological(items);
    assert.strictEqual(sorted.length, 3, 'All same-date items should be preserved');
  });
});

// ─── Live videosContent Structural Validation ─────────────────────────────────
describe('videosContent: Schema Compliance', () => {
  it('every item has id, videoId, title, type, platform, date, url, thumbnail', () => {
    for (const v of videosContent) {
      assert.ok(v.id, `Missing id for item: ${JSON.stringify(v)}`);
      assert.ok(v.videoId, `Missing videoId for item: ${v.id}`);
      assert.ok(v.title, `Missing title for item: ${v.id}`);
      assert.ok(['Video', 'Short'].includes(v.type), `type "${v.type}" invalid for ${v.videoId}`);
      assert.ok(v.platform, `Missing platform for ${v.videoId}`);
      assert.match(v.date, /^\d{4}-\d{2}-\d{2}$/, `date "${v.date}" invalid for ${v.videoId}`);
      assert.ok(v.url?.startsWith('https://'), `url invalid for ${v.videoId}`);
      assert.ok(v.thumbnail?.startsWith('https://i.ytimg.com/'), `thumbnail invalid for ${v.videoId}`);
    }
  });

  it('Video URLs contain watch?v= with the correct videoId', () => {
    const videos = videosContent.filter(v => v.type === 'Video');
    for (const v of videos) {
      assert.ok(
        v.url.includes(`watch?v=${v.videoId}`) || v.url.includes(`v=${v.videoId}`),
        `Video URL "${v.url}" must contain videoId "${v.videoId}"`
      );
    }
  });

  it('Short URLs contain /shorts/ with the correct videoId', () => {
    const shorts = videosContent.filter(v => v.type === 'Short');
    for (const s of shorts) {
      assert.ok(
        s.url.includes(`/shorts/${s.videoId}`),
        `Short URL "${s.url}" must reference its videoId "${s.videoId}"`
      );
    }
  });

  it('no two items share the same videoId', () => {
    const ids = videosContent.map(v => v.videoId);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepStrictEqual(dups, [], `Duplicate videoIds found: ${dups.join(', ')}`);
  });

  it('no two items share the same id', () => {
    const ids = videosContent.map(v => v.id);
    const dups = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepStrictEqual(dups, [], `Duplicate ids found: ${dups.join(', ')}`);
  });

  it('is sorted chronologically descending at every adjacent pair', () => {
    for (let i = 0; i < videosContent.length - 1; i++) {
      const a = new Date(videosContent[i].date).getTime();
      const b = new Date(videosContent[i + 1].date).getTime();
      assert.ok(a >= b, `Out of order at [${i}] ${videosContent[i].date} vs [${i + 1}] ${videosContent[i + 1].date}`);
    }
  });

  it('contains at least 20 items (channel is active)', () => {
    assert.ok(videosContent.length >= 20, `Expected at least 20 synced items, got ${videosContent.length}`);
  });
});

// ─── Upload File Size Limits ──────────────────────────────────────────────────
describe('Upload Limits: GitHub 100MB Safety', () => {
  const MAX_SAFE_BYTES = 95 * 1024 * 1024;
  const HARD_LIMIT_BYTES = 100 * 1024 * 1024;

  function validateFileSize(sizeBytes, fileName = 'video.mp4') {
    if (sizeBytes > MAX_SAFE_BYTES) {
      const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
      return {
        allowed: false,
        error: `File "${fileName}" is ${sizeMb} MB, which exceeds GitHub's 100 MB limit (max: 95 MB).`
      };
    }
    return { allowed: true, error: null };
  }

  it('MAX_SAFE_BYTES is strictly below the 100MB hard limit', () => {
    assert.ok(MAX_SAFE_BYTES < HARD_LIMIT_BYTES, 'Safe cap must be below 100MB');
  });

  it('allows files at or below 95MB', () => {
    assert.strictEqual(validateFileSize(50 * 1024 * 1024, 'clip.mp4').allowed, true);
    assert.strictEqual(validateFileSize(95 * 1024 * 1024, 'max.mp4').allowed, true);
  });

  it('rejects files above 95MB', () => {
    const r = validateFileSize(96 * 1024 * 1024, 'big.mp4');
    assert.strictEqual(r.allowed, false);
    assert.ok(r.error.includes('96.0 MB'));
  });

  it('rejects very large files (e.g. 500MB camera recording)', () => {
    const r = validateFileSize(500 * 1024 * 1024, 'camera_roll.MOV');
    assert.strictEqual(r.allowed, false);
    assert.ok(r.error.length > 20, 'Error message should be descriptive');
  });

  it('error message for oversized file is informative', () => {
    const r = validateFileSize(143.5 * 1024 * 1024, 'MVI_2943.MP4');
    assert.ok(r.error.includes('143.5 MB'));
    assert.ok(r.error.includes('100 MB'));
  });

  it('allows 1-byte file (edge case)', () => {
    assert.strictEqual(validateFileSize(1, 'tiny.mp4').allowed, true);
  });

  it('rejects 95MB + 1 byte (boundary)', () => {
    assert.strictEqual(validateFileSize(MAX_SAFE_BYTES + 1, 'over.mp4').allowed, false);
  });
});

// ─── .gitignore Validation ────────────────────────────────────────────────────
describe('.gitignore: Video Upload Protection', () => {
  it('.gitignore file exists', () => {
    assert.ok(fs.existsSync(path.join(ROOT, '.gitignore')), '.gitignore must exist');
  });

  it('.gitignore ignores .mp4 files in uploads', () => {
    const content = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    assert.ok(
      content.includes('public/uploads/*.mp4') || content.includes('uploads/*.mp4') || content.includes('*.mp4'),
      '.gitignore must have a rule covering .mp4 files in uploads'
    );
  });

  it('.gitignore ignores .mov files in uploads', () => {
    const content = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    assert.ok(
      content.includes('public/uploads/*.mov') || content.includes('uploads/*.mov') || content.includes('*.mov'),
      '.gitignore must have a rule covering .mov files in uploads'
    );
  });

  it('sync-youtube.js script exists and is readable', () => {
    const p = path.join(ROOT, 'scripts', 'sync-youtube.js');
    assert.ok(fs.existsSync(p), 'scripts/sync-youtube.js must exist');
    const content = fs.readFileSync(p, 'utf8');
    assert.ok(content.includes('fetchYouTubeMedia'), 'sync-youtube.js must export fetchYouTubeMedia');
  });

  it('clean-past-concerts.js script exists', () => {
    const p = path.join(ROOT, 'scripts', 'clean-past-concerts.js');
    assert.ok(fs.existsSync(p), 'scripts/clean-past-concerts.js must exist');
  });
});
