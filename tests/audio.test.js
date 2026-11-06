import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatTime, resolveAudioSrc, filterTracksByLanguage } from '../src/utils/audio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Music Showcase & Audio Player Feature', () => {
  describe('formatTime', () => {
    it('formats 0 seconds as 00:00', () => {
      assert.strictEqual(formatTime(0), '00:00');
    });

    it('formats seconds with leading zeroes', () => {
      assert.strictEqual(formatTime(9), '00:09');
      assert.strictEqual(formatTime(65), '01:05');
      assert.strictEqual(formatTime(255), '04:15');
    });

    it('handles negative or non-numeric values safely', () => {
      assert.strictEqual(formatTime(-10), '00:00');
      assert.strictEqual(formatTime(NaN), '00:00');
      assert.strictEqual(formatTime(null), '00:00');
    });
  });

  describe('resolveAudioSrc', () => {
    it('preserves external http/https and streaming URLs', () => {
      const ext = 'https://stream.example.com/audio.mp3';
      assert.strictEqual(resolveAudioSrc(ext), ext);
    });

    it('preserves blob and data URLs', () => {
      assert.strictEqual(resolveAudioSrc('blob:http://localhost/123'), 'blob:http://localhost/123');
      assert.strictEqual(resolveAudioSrc('data:audio/mp3;base64,...'), 'data:audio/mp3;base64,...');
    });

    it('resolves local uploads to localhost:3001 in dev / electron environments', () => {
      const resolvedDev = resolveAudioSrc('/uploads/song.mp3', { isDev: true });
      assert.strictEqual(resolvedDev, 'http://localhost:3001/uploads/song.mp3');

      const resolvedElectron = resolveAudioSrc('/uploads/song.mp3', { isElectron: true });
      assert.strictEqual(resolvedElectron, 'http://localhost:3001/uploads/song.mp3');
    });

    it('resolves uploads relative to base url in production web environment', () => {
      const resolvedProd = resolveAudioSrc('/uploads/song.mp3', { isDev: false, baseUrl: '/MS_Music.Com/' });
      assert.strictEqual(resolvedProd, '/MS_Music.Com/uploads/song.mp3');
    });
  });

  describe('filterTracksByLanguage', () => {
    const mockTracks = [
      { id: 1, title: 'Track 1', language: 'Tamil' },
      { id: 2, title: 'Track 2', language: 'Konkani' },
      { id: 3, title: 'Track 3', language: 'Hindi' },
      { id: 4, title: 'Track 4', language: 'Tamil' }
    ];

    it('returns all tracks when language is "All"', () => {
      const res = filterTracksByLanguage(mockTracks, 'All');
      assert.strictEqual(res.length, 4);
    });

    it('filters tracks by specified language (case-insensitive)', () => {
      const tamilTracks = filterTracksByLanguage(mockTracks, 'tamil');
      assert.strictEqual(tamilTracks.length, 2);
      assert.deepStrictEqual(tamilTracks.map(t => t.id), [1, 4]);

      const konkaniTracks = filterTracksByLanguage(mockTracks, 'Konkani');
      assert.strictEqual(konkaniTracks.length, 1);
      assert.strictEqual(konkaniTracks[0].id, 2);
    });
  });

  describe('Audio Tracks Data Integrity', () => {
    it('verifies that audio.js exists and exports a valid tracks array structure', () => {
      const audioJsPath = path.resolve(__dirname, '..', 'src', 'content', 'audio.js');
      assert.ok(fs.existsSync(audioJsPath), 'audio.js must exist');
      const content = fs.readFileSync(audioJsPath, 'utf-8');
      assert.match(content, /export const audioTracksContent = \[/);
      assert.match(content, /title:/);
      assert.match(content, /duration:/);
    });
  });
});
