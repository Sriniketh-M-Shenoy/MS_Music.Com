import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { socialsContent } from '../src/content/socials.js';

describe('Social Media Links & Channel Verification', () => {
  it('has the correct YouTube channel URL without typo', () => {
    assert.strictEqual(
      socialsContent.youtube,
      'https://www.youtube.com/@muralidharshenoykochi',
      'YouTube channel link must match @muralidharshenoykochi'
    );
  });

  it('has the correct YouTube handle', () => {
    assert.strictEqual(
      socialsContent.youtubeHandle,
      '@muralidharshenoykochi',
      'YouTube handle must be @muralidharshenoykochi'
    );
  });

  it('has a valid YouTube subscribe confirmation link', () => {
    assert.ok(
      socialsContent.youtubeSubscribe.includes('@muralidharshenoykochi'),
      'Subscribe link must target @muralidharshenoykochi'
    );
    assert.ok(
      socialsContent.youtubeSubscribe.includes('sub_confirmation=1'),
      'Subscribe link must include sub_confirmation parameter'
    );
  });

  it('verifies that no legacy typo handle exists across socialsContent', () => {
    const raw = JSON.stringify(socialsContent);
    assert.strictEqual(
      raw.includes('muralidhargshenoykochi'),
      false,
      'Must not contain typo muralidhargshenoykochi'
    );
  });
});
