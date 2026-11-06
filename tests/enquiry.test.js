import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatGoogleFormEmbedUrl, generateEnquiryMailto } from '../src/utils/enquiry.js';

describe('Enquiry & Booking Form Feature', () => {
  describe('formatGoogleFormEmbedUrl', () => {
    it('returns default Google Form embed URL when input is empty or placeholder', () => {
      const defaultUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSf6l5M_fN5wiZL2p7vWhLEZQUXpDIkhxdhl2C-GKPNp5aQK1g/viewform?embedded=true';
      assert.strictEqual(formatGoogleFormEmbedUrl(''), defaultUrl);
      assert.strictEqual(formatGoogleFormEmbedUrl(null), defaultUrl);
      assert.strictEqual(formatGoogleFormEmbedUrl('https://docs.google.com/forms/d/dummyFormIdHere/viewform'), defaultUrl);
    });

    it('ensures embedded=true is appended to viewform links', () => {
      const raw = 'https://docs.google.com/forms/d/e/12345/viewform';
      const formatted = formatGoogleFormEmbedUrl(raw);
      assert.strictEqual(formatted, 'https://docs.google.com/forms/d/e/12345/viewform?embedded=true');
    });

    it('preserves existing embedded=true URLs', () => {
      const proper = 'https://docs.google.com/forms/d/e/12345/viewform?embedded=true';
      assert.strictEqual(formatGoogleFormEmbedUrl(proper), proper);
    });
  });

  describe('generateEnquiryMailto', () => {
    it('creates a formatted mailto URI with subject and body', () => {
      const link = generateEnquiryMailto({
        email: 'booking.muralidharshenoy@gmail.com',
        name: 'Anand Rao',
        senderEmail: 'anand@example.com',
        phone: '+91 9876543210',
        eventDate: '2026-12-10',
        eventTime: '6:00 PM',
        message: 'Looking to book for our annual temple festival.'
      });

      assert.ok(link.startsWith('mailto:booking.muralidharshenoy@gmail.com?subject='));
      assert.ok(link.includes('subject=Concert%20Booking%20Enquiry%20from%20Anand%20Rao'));
      assert.ok(link.includes('Anand%20Rao'));
      assert.ok(link.includes('2026-12-10'));
      assert.ok(link.includes('annual%20temple%20festival'));
    });

    it('handles missing optional fields with default fallbacks', () => {
      const link = generateEnquiryMailto({
        name: 'Pooja',
        message: 'Private celebration concert'
      });

      assert.ok(link.startsWith('mailto:booking.muralidharshenoy@gmail.com'));
      assert.ok(link.includes('Pooja'));
      assert.ok(link.includes('Not%20specified'));
    });
  });
});
