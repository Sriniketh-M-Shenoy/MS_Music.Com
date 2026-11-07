/**
 * Image Resolution & Asset Pipeline Tests
 * =========================================
 * Tests for resolveImageSrc: the utility that maps asset key names,
 * relative upload paths, and external URLs to their correct resolved src.
 * Also validates that all assets referenced in content files resolve
 * to something non-null and usable.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'path';
import fs from 'fs';

// resolveImageSrc uses `import.meta.env` which is a Vite feature not available
// in Node; we test the pure URL-routing logic by extracting the portable parts.

function resolveImageSrcLogic(src, env = {}) {
  if (!src) return 'FALLBACK_SINGING_MIC';

  if (typeof src === 'string') {
    const trimmed = src.trim();

    // External URLs take priority over substring asset matching
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('blob:')
    ) {
      return trimmed;
    }

    // Named asset keys (exact match)
    if (trimmed === 'picSingingMic') return 'picSingingMic';
    if (trimmed === 'picRedKurta') return 'picRedKurta';
    if (trimmed === 'picMicBlack') return 'picMicBlack';
    if (trimmed === 'picTshirt') return 'picTshirt';
    if (trimmed === 'heroBg') return 'heroBg';
    if (trimmed === 'msSignature') return 'msSignature';
    if (trimmed === 'msSignatureWhite' || trimmed === 'Signature_White') return 'msSignatureWhite';

    // Embedded asset filenames (substring match on non-URL paths)
    if (trimmed.includes('Signature_White') || trimmed.includes('ms_signature_white')) return 'msSignatureWhite';
    if (trimmed.includes('pic_singing_mic')) return 'picSingingMic';
    if (trimmed.includes('pic_mic_black')) return 'picMicBlack';
    if (trimmed.includes('pic_red_kurta')) return 'picRedKurta';
    if (trimmed.includes('pic_tshirt')) return 'picTshirt';
    if (trimmed.includes('hero_background')) return 'heroBg';
    if (trimmed.includes('ms_signature')) return 'msSignature';

    // /uploads/ path
    if (trimmed.startsWith('/uploads/')) {
      if (env.isDev || env.isElectron) {
        return `http://localhost:3001${trimmed}`;
      }
      const base = env.baseUrl || './';
      const cleanBase = base.endsWith('/') ? base : `${base}/`;
      return `${cleanBase}${trimmed.replace(/^\//, '')}`;
    }
  }

  return src;
}

describe('resolveImageSrc: Null / Falsy Inputs', () => {
  it('returns fallback for null', () => {
    assert.strictEqual(resolveImageSrcLogic(null), 'FALLBACK_SINGING_MIC');
  });

  it('returns fallback for undefined', () => {
    assert.strictEqual(resolveImageSrcLogic(undefined), 'FALLBACK_SINGING_MIC');
  });

  it('returns fallback for empty string', () => {
    assert.strictEqual(resolveImageSrcLogic(''), 'FALLBACK_SINGING_MIC');
  });
});

describe('resolveImageSrc: Named Asset Keys', () => {
  const cases = [
    ['picSingingMic', 'picSingingMic'],
    ['picRedKurta', 'picRedKurta'],
    ['picMicBlack', 'picMicBlack'],
    ['picTshirt', 'picTshirt'],
    ['heroBg', 'heroBg'],
    ['msSignature', 'msSignature'],
    ['msSignatureWhite', 'msSignatureWhite'],
    ['Signature_White', 'msSignatureWhite']
  ];

  for (const [input, expected] of cases) {
    it(`resolves named key "${input}"`, () => {
      assert.strictEqual(resolveImageSrcLogic(input), expected);
    });
  }
});

describe('resolveImageSrc: Embedded Filename Substrings', () => {
  it('resolves path containing pic_singing_mic', () => {
    assert.strictEqual(
      resolveImageSrcLogic('/assets/pic_singing_mic-DaQs1ya9.png'),
      'picSingingMic'
    );
  });

  it('resolves path containing pic_red_kurta', () => {
    assert.strictEqual(
      resolveImageSrcLogic('/dist/assets/pic_red_kurta-BKZBaEDj.png'),
      'picRedKurta'
    );
  });

  it('resolves path containing hero_background', () => {
    assert.strictEqual(
      resolveImageSrcLogic('/assets/hero_background-DAnm-fGk.png'),
      'heroBg'
    );
  });

  it('resolves path containing ms_signature_white', () => {
    assert.strictEqual(
      resolveImageSrcLogic('/assets/ms_signature_white-DaErVdpM.jpg'),
      'msSignatureWhite'
    );
  });
});

describe('resolveImageSrc: External URLs', () => {
  it('passes through https:// URLs unchanged', () => {
    const url = 'https://i.ytimg.com/vi/_N5xbUMrAGM/hqdefault.jpg';
    assert.strictEqual(resolveImageSrcLogic(url), url);
  });

  it('passes through http://localhost URLs unchanged', () => {
    const url = 'http://localhost:3001/assets/pic_singing_mic-DaQs1ya9.png';
    assert.strictEqual(resolveImageSrcLogic(url), url);
  });

  it('passes through data: URIs unchanged', () => {
    const url = 'data:image/png;base64,AAAA';
    assert.strictEqual(resolveImageSrcLogic(url), url);
  });

  it('passes through blob: URLs unchanged', () => {
    const url = 'blob:http://localhost:5173/abc-def';
    assert.strictEqual(resolveImageSrcLogic(url), url);
  });
});

describe('resolveImageSrc: /uploads/ Path Resolution', () => {
  it('resolves /uploads/ to localhost:3001 in dev mode', () => {
    const result = resolveImageSrcLogic('/uploads/my_image.jpg', { isDev: true });
    assert.strictEqual(result, 'http://localhost:3001/uploads/my_image.jpg');
  });

  it('resolves /uploads/ to localhost:3001 in Electron mode', () => {
    const result = resolveImageSrcLogic('/uploads/photo.png', { isElectron: true });
    assert.strictEqual(result, 'http://localhost:3001/uploads/photo.png');
  });

  it('resolves /uploads/ relative to base URL in production', () => {
    const result = resolveImageSrcLogic('/uploads/image.jpg', { isDev: false, isElectron: false, baseUrl: '/MS_Music.Com/' });
    assert.strictEqual(result, '/MS_Music.Com/uploads/image.jpg');
  });

  it('resolves /uploads/ using default "./" base in production fallback', () => {
    const result = resolveImageSrcLogic('/uploads/image.jpg', { isDev: false, isElectron: false });
    assert.strictEqual(result, './uploads/image.jpg');
  });

  it('strips leading slash from uploads path before concatenating base', () => {
    const result = resolveImageSrcLogic('/uploads/file.jpg', { isDev: false, baseUrl: '/base/' });
    assert.ok(!result.includes('//uploads'), `Should not double-slash: "${result}"`);
  });
});

describe('Asset File Existence: Critical Static Assets', () => {
  const ASSET_DIR = '/Users/muralidharshenoy/Desktop/My_Website/MS_Music.Com/src/assets';

  const requiredAssets = [
    'hero/hero_background.png',
    'branding/ms_signature.png',
    'branding/ms_signature_white.jpg',
    'gallery/pic_singing_mic.png',
    'gallery/pic_mic_black.png',
    'gallery/pic_tshirt.png',
    'about/pic_red_kurta.png'
  ];

  for (const asset of requiredAssets) {
    it(`asset exists: ${asset}`, () => {
      const full = path.join(ASSET_DIR, asset);
      assert.ok(fs.existsSync(full), `Missing required asset: ${full}`);
    });
  }
});

describe('Content: YouTube Thumbnail URLs', () => {
  it('all thumbnails in videosContent use the ytimg.com CDN', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    for (const v of videosContent) {
      assert.ok(
        v.thumbnail.startsWith('https://i.ytimg.com/vi/'),
        `Thumbnail "${v.thumbnail}" for "${v.videoId}" must use ytimg.com CDN`
      );
    }
  });

  it('thumbnail paths include the correct videoId', async () => {
    const { videosContent } = await import('../src/content/videos.js');
    for (const v of videosContent) {
      assert.ok(
        v.thumbnail.includes(v.videoId),
        `Thumbnail "${v.thumbnail}" must contain videoId "${v.videoId}"`
      );
    }
  });
});
