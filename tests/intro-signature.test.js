import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Intro Signature & Splash Screen Feature', () => {
  it('verifies signature gif asset exists and is accessible', () => {
    const gifPath = path.resolve(__dirname, '..', 'src', 'assets', 'branding', 'MS_signature_signing.gif');
    assert.ok(fs.existsSync(gifPath), 'MS_signature_signing.gif must exist');
    const stats = fs.statSync(gifPath);
    assert.ok(stats.size > 10000, `GIF file size should be substantial (got ${stats.size} bytes)`);
  });

  it('verifies IntroLoader component contains proper timing parameters', () => {
    const loaderPath = path.resolve(__dirname, '..', 'src', 'components', 'IntroLoader.jsx');
    assert.ok(fs.existsSync(loaderPath));
    const content = fs.readFileSync(loaderPath, 'utf-8');

    // 3.3s display duration ensures signature finishes drawing before fading out
    assert.ok(content.includes('3300'), 'Must contain 3300ms display timer');
    assert.ok(content.includes('3900'), 'Must contain 3900ms exit completion timer');
    assert.ok(content.includes('handleSkip'), 'Must support interactive tap/click to skip');
  });
});
