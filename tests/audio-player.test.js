/**
 * Audio Utility Functional Tests
 * ================================
 * Comprehensive tests for the audio player helpers:
 *   - formatTime: converts seconds to MM:SS display
 *   - resolveAudioSrc: routes audio URLs for dev/electron/production
 *   - filterTracksByLanguage: filters audio track list by language
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime, resolveAudioSrc, filterTracksByLanguage } from '../src/utils/audio.js';

describe('Audio Player: formatTime', () => {
  it('formats 0 seconds as 00:00', () => {
    assert.strictEqual(formatTime(0), '00:00');
  });

  it('formats 59 seconds as 00:59', () => {
    assert.strictEqual(formatTime(59), '00:59');
  });

  it('formats 60 seconds as 01:00', () => {
    assert.strictEqual(formatTime(60), '01:00');
  });

  it('formats 3661 seconds as 61:01', () => {
    assert.strictEqual(formatTime(3661), '61:01');
  });

  it('pads single-digit seconds with leading zero', () => {
    assert.strictEqual(formatTime(65), '01:05');
  });

  it('pads single-digit minutes with leading zero', () => {
    assert.strictEqual(formatTime(9 * 60 + 3), '09:03');
  });

  it('handles NaN gracefully', () => {
    assert.strictEqual(formatTime(NaN), '00:00');
  });

  it('handles negative values gracefully', () => {
    assert.strictEqual(formatTime(-10), '00:00');
  });

  it('handles undefined gracefully', () => {
    assert.strictEqual(formatTime(undefined), '00:00');
  });

  it('rounds down fractional seconds', () => {
    assert.strictEqual(formatTime(90.9), '01:30');
  });
});

describe('Audio Player: resolveAudioSrc', () => {
  it('passes through https:// URLs unchanged', () => {
    const url = 'https://cdn.example.com/tracks/song.mp3';
    assert.strictEqual(resolveAudioSrc(url), url);
  });

  it('passes through http:// URLs unchanged', () => {
    const url = 'http://localhost:3001/uploads/song.m4a';
    assert.strictEqual(resolveAudioSrc(url), url);
  });

  it('passes through Spotify streaming URLs unchanged', () => {
    const url = 'https://open.spotify.com/track/abc123';
    assert.strictEqual(resolveAudioSrc(url), url);
  });

  it('passes through blob: URLs unchanged', () => {
    const url = 'blob:http://localhost:5173/abc-def';
    assert.strictEqual(resolveAudioSrc(url), url);
  });

  it('passes through data: URLs unchanged', () => {
    const url = 'data:audio/mp3;base64,AAAA';
    assert.strictEqual(resolveAudioSrc(url), url);
  });

  it('resolves /uploads/ path to localhost:3001 in dev environment', () => {
    const result = resolveAudioSrc('/uploads/song.m4a', { isDev: true });
    assert.strictEqual(result, 'http://localhost:3001/uploads/song.m4a');
  });

  it('resolves /uploads/ path to localhost:3001 in Electron environment', () => {
    const result = resolveAudioSrc('/uploads/song.mp3', { isElectron: true });
    assert.strictEqual(result, 'http://localhost:3001/uploads/song.mp3');
  });

  it('resolves /uploads/ relative to baseUrl in production', () => {
    const result = resolveAudioSrc('/uploads/song.mp3', { isDev: false, isElectron: false, baseUrl: '/MS_Music.Com/' });
    assert.strictEqual(result, '/MS_Music.Com/uploads/song.mp3');
  });

  it('resolves /uploads/ using default base ./ in production fallback', () => {
    const result = resolveAudioSrc('/uploads/track.m4a', { isDev: false, isElectron: false, baseUrl: './' });
    assert.strictEqual(result, './uploads/track.m4a');
  });

  it('returns empty string for null/undefined input', () => {
    assert.strictEqual(resolveAudioSrc(null), '');
    assert.strictEqual(resolveAudioSrc(undefined), '');
    assert.strictEqual(resolveAudioSrc(''), '');
  });
});

describe('Audio Player: filterTracksByLanguage', () => {
  const tracks = [
    { id: 1, title: 'Song A', language: 'Kannada' },
    { id: 2, title: 'Song B', language: 'Hindi' },
    { id: 3, title: 'Song C', language: 'Konkani' },
    { id: 4, title: 'Song D', language: 'Malayalam' },
    { id: 5, title: 'Song E', language: 'Tamil' },
    { id: 6, title: 'Song F', language: 'Kannada' },
  ];

  it('returns all tracks when language is "All"', () => {
    const result = filterTracksByLanguage(tracks, 'All');
    assert.strictEqual(result.length, 6);
  });

  it('returns all tracks when language is null', () => {
    const result = filterTracksByLanguage(tracks, null);
    assert.strictEqual(result.length, 6);
  });

  it('filters by exact language case-insensitively', () => {
    const lower = filterTracksByLanguage(tracks, 'kannada');
    const upper = filterTracksByLanguage(tracks, 'KANNADA');
    assert.strictEqual(lower.length, 2);
    assert.strictEqual(upper.length, 2);
  });

  it('returns empty array for a language not in the list', () => {
    const result = filterTracksByLanguage(tracks, 'Bengali');
    assert.strictEqual(result.length, 0);
  });

  it('filters Malayalam correctly', () => {
    const result = filterTracksByLanguage(tracks, 'Malayalam');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].title, 'Song D');
  });

  it('handles an empty tracks array gracefully', () => {
    assert.deepStrictEqual(filterTracksByLanguage([], 'Kannada'), []);
  });

  it('handles null tracks array gracefully', () => {
    assert.deepStrictEqual(filterTracksByLanguage(null, 'Kannada'), []);
  });

  it('does not mutate the original tracks array', () => {
    const original = [...tracks];
    filterTracksByLanguage(tracks, 'Hindi');
    assert.strictEqual(tracks.length, original.length);
  });
});
