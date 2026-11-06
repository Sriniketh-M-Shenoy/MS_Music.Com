import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { concertNotificationsConfig, eventsContent } from '../src/content/events.js';
import { formatConcertFormEmbedUrl } from '../src/utils/concerts.js';

describe('Concert Notifications & Tour Alerts Feature', () => {
  describe('Configuration Schema & Default Values', () => {
    it('exports a valid concertNotificationsConfig from events.js', () => {
      assert.ok(concertNotificationsConfig, 'concertNotificationsConfig should be exported');
      assert.strictEqual(typeof concertNotificationsConfig, 'object');
      assert.strictEqual(concertNotificationsConfig.enabled, true);
      assert.ok(concertNotificationsConfig.formUrl, 'formUrl must be defined');
      assert.ok(
        concertNotificationsConfig.formUrl.includes('1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI'),
        'formUrl must use the user-specified Google Form ID'
      );
    });

    it('has high-CTR title, badge, and descriptive copy', () => {
      assert.ok(concertNotificationsConfig.title.length > 0);
      assert.ok(concertNotificationsConfig.buttonText.length > 0);
      assert.ok(concertNotificationsConfig.badgeText.length > 0);
      assert.ok(concertNotificationsConfig.description.length > 0);
    });

    it('coexists with eventsContent array in events.js without conflict', () => {
      assert.ok(Array.isArray(eventsContent), 'eventsContent must be an array');
    });
  });

  describe('formatConcertFormEmbedUrl Helper', () => {
    it('returns default viewform embedded URL when input is empty', () => {
      const formatted = formatConcertFormEmbedUrl('');
      assert.ok(formatted.includes('viewform?embedded=true'));
    });

    it('converts /preview links to /viewform?embedded=true for seamless embedding', () => {
      const input = 'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/preview';
      const formatted = formatConcertFormEmbedUrl(input);
      assert.strictEqual(
        formatted,
        'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform?embedded=true'
      );
    });

    it('converts plain /viewform links to include embedded=true parameter', () => {
      const input = 'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform';
      const formatted = formatConcertFormEmbedUrl(input);
      assert.strictEqual(
        formatted,
        'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform?embedded=true'
      );
    });

    it('preserves URLs that already contain embedded=true', () => {
      const input = 'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform?embedded=true';
      const formatted = formatConcertFormEmbedUrl(input);
      assert.strictEqual(formatted, input);
    });
  });
});
