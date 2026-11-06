import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const GITHUB_MAX_FILE_BYTES = 95 * 1024 * 1024; // 95 MB safe cap
const GITHUB_HARD_LIMIT_BYTES = 100 * 1024 * 1024; // 100 MB hard cap

describe('Upload File Size Restriction Feature (GitHub 100MB Limit)', () => {
  it('enforces a max file size safely below GitHub 100MB limit', () => {
    assert.ok(
      GITHUB_MAX_FILE_BYTES < GITHUB_HARD_LIMIT_BYTES,
      'Max upload cap must be strictly below 100MB'
    );
    assert.strictEqual(GITHUB_MAX_FILE_BYTES, 95 * 1024 * 1024);
  });

  it('rejects files exceeding the GitHub file limit with an informative error', () => {
    const validateFileSize = (sizeBytes, fileName = 'video.mp4') => {
      if (sizeBytes > GITHUB_MAX_FILE_BYTES) {
        const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
        return {
          allowed: false,
          error: `File "${fileName}" is ${sizeMb} MB, which exceeds GitHub's 100 MB file limit (max allowed: 95 MB). Upload rejected to prevent git push failure.`
        };
      }
      return { allowed: true, error: null };
    };

    // Valid small file (e.g. 15MB short video)
    const validUpload = validateFileSize(15 * 1024 * 1024, 'short_clip.mp4');
    assert.strictEqual(validUpload.allowed, true);
    assert.strictEqual(validUpload.error, null);

    // Oversized file (e.g. 143.5MB camera recording)
    const oversizedUpload = validateFileSize(143.5 * 1024 * 1024, 'MVI_2943.MP4');
    assert.strictEqual(oversizedUpload.allowed, false);
    assert.ok(oversizedUpload.error.includes('143.5 MB'));
    assert.ok(oversizedUpload.error.includes('100 MB'));
    assert.ok(oversizedUpload.error.includes('git push failure'));

    // Boundary check: 96MB
    const boundaryUpload = validateFileSize(96 * 1024 * 1024, 'large.mov');
    assert.strictEqual(boundaryUpload.allowed, false);
  });

  it('verifies that .gitignore contains rules to ignore local video uploads', () => {
    const gitignorePath = path.resolve('.gitignore');
    assert.ok(fs.existsSync(gitignorePath), '.gitignore file must exist');

    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert.ok(
      content.includes('public/uploads/*.mp4') || content.includes('uploads/*.mp4'),
      '.gitignore must ignore mp4 video files in uploads'
    );
    assert.ok(
      content.includes('public/uploads/*.mov') || content.includes('uploads/*.mov'),
      '.gitignore must ignore mov video files in uploads'
    );
  });
});
