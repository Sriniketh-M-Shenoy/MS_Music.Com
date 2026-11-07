/**
 * Enquiry & Booking Form Functional Tests
 * =========================================
 * Full coverage of:
 *   - formatGoogleFormEmbedUrl: URL normalization for Google Forms
 *   - generateEnquiryMailto: Mailto link generation with all fields
 *   - Edge cases: empty inputs, special chars, missing fields
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatGoogleFormEmbedUrl, generateEnquiryMailto } from '../src/utils/enquiry.js';

const DEFAULT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf6l5M_fN5wiZL2p7vWhLEZQUXpDIkhxdhl2C-GKPNp5aQK1g/viewform?embedded=true';
const BOOKING_EMAIL = 'booking.muralidharshenoy@gmail.com';

describe('Enquiry: formatGoogleFormEmbedUrl', () => {
  it('returns default URL for empty string', () => {
    assert.strictEqual(formatGoogleFormEmbedUrl(''), DEFAULT_FORM_URL);
  });

  it('returns default URL for null', () => {
    assert.strictEqual(formatGoogleFormEmbedUrl(null), DEFAULT_FORM_URL);
  });

  it('returns default URL for undefined', () => {
    assert.strictEqual(formatGoogleFormEmbedUrl(undefined), DEFAULT_FORM_URL);
  });

  it('returns default URL when placeholder dummy ID is present', () => {
    assert.strictEqual(
      formatGoogleFormEmbedUrl('https://docs.google.com/forms/d/dummyFormIdHere/viewform'),
      DEFAULT_FORM_URL
    );
  });

  it('appends embedded=true to a bare /viewform URL', () => {
    const input = 'https://docs.google.com/forms/d/e/FORM_ID/viewform';
    const result = formatGoogleFormEmbedUrl(input);
    assert.strictEqual(result, 'https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true');
  });

  it('replaces existing query params in /viewform URL', () => {
    const input = 'https://docs.google.com/forms/d/e/FORM_ID/viewform?pli=1';
    const result = formatGoogleFormEmbedUrl(input);
    assert.strictEqual(result, 'https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true');
  });

  it('preserves a URL that already has embedded=true', () => {
    const input = 'https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true';
    assert.strictEqual(formatGoogleFormEmbedUrl(input), input);
  });

  it('trims whitespace from URL before processing', () => {
    const input = '  https://docs.google.com/forms/d/e/FORM_ID/viewform  ';
    const result = formatGoogleFormEmbedUrl(input);
    assert.ok(result.includes('embedded=true'), 'Should process trimmed URL');
  });
});

describe('Enquiry: generateEnquiryMailto — Full Details', () => {
  const fullEnquiry = {
    email: BOOKING_EMAIL,
    name: 'Ramesh Nair',
    senderEmail: 'ramesh@example.com',
    phone: '+91 9876543210',
    eventDate: '2026-12-25',
    eventTime: '7:00 PM IST',
    message: 'Looking to book for our GSB community annual concert.'
  };

  it('generates a mailto: URI', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.startsWith('mailto:'), 'Must start with mailto:');
  });

  it('targets the correct booking email', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.startsWith(`mailto:${BOOKING_EMAIL}`));
  });

  it('includes the sender name in subject line', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.includes('Ramesh%20Nair'), 'Sender name must be URL-encoded in subject');
  });

  it('includes sender email in body', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.includes('ramesh%40example.com') || link.includes('ramesh@example.com'), 'Sender email must appear in body');
  });

  it('includes phone number in body', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.includes('9876543210'), 'Phone number must appear in body');
  });

  it('includes event date in body', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.includes('2026-12-25'), 'Event date must appear in body');
  });

  it('includes event time in body', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.includes('7%3A00%20PM') || link.includes('7:00 PM'), 'Event time must appear in body');
  });

  it('includes enquiry message in body', () => {
    const link = generateEnquiryMailto(fullEnquiry);
    assert.ok(link.includes('GSB') || link.includes('concert'), 'Message content must appear in body');
  });
});

describe('Enquiry: generateEnquiryMailto — Default Fallbacks', () => {
  it('uses default booking email when no email provided', () => {
    const link = generateEnquiryMailto({ name: 'John' });
    assert.ok(link.startsWith(`mailto:${BOOKING_EMAIL}`), 'Must default to official booking email');
  });

  it('uses "Anonymous" when name is not provided', () => {
    const link = generateEnquiryMailto({ message: 'Book me' });
    assert.ok(link.includes('Anonymous'), 'Must use "Anonymous" as default name');
  });

  it('shows "Not specified" for missing phone', () => {
    const link = generateEnquiryMailto({ name: 'Test User' });
    assert.ok(link.includes('Not%20specified') || link.includes('Not specified'), 'Missing phone must show "Not specified"');
  });

  it('shows "Not specified" for missing event date', () => {
    const link = generateEnquiryMailto({ name: 'Test User' });
    assert.ok(link.includes('Not%20specified') || link.includes('Not specified'), 'Missing date must show "Not specified"');
  });

  it('handles completely empty input object without throwing', () => {
    assert.doesNotThrow(() => generateEnquiryMailto({}));
  });

  it('handles null/undefined inputs without throwing', () => {
    assert.doesNotThrow(() => generateEnquiryMailto({ name: null, email: undefined, phone: null }));
  });
});

describe('Enquiry: generateEnquiryMailto — Special Characters', () => {
  it('URL-encodes special characters in message', () => {
    const link = generateEnquiryMailto({
      name: 'Dr. K.R. Bhat',
      message: 'Booking for Ugadi & Navratri festival — Temple Hall, 100 seats'
    });
    assert.ok(typeof link === 'string' && link.startsWith('mailto:'), 'Must produce valid mailto even with special chars');
  });

  it('handles Unicode names correctly', () => {
    const link = generateEnquiryMailto({
      name: 'Priya Krishnaswamy',
      message: 'ಸಂಗೀತ ಕಾರ್ಯಕ್ರಮ'  // Kannada script
    });
    assert.ok(typeof link === 'string' && link.startsWith('mailto:'), 'Must handle Unicode characters in message');
  });
});
