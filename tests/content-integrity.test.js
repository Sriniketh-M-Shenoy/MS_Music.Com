/**
 * Content Integrity Tests
 * =======================
 * Validates that every content module exports structurally correct data
 * that the site depends on. Catches regressions if content files are
 * accidentally corrupted or missing required fields.
 *
 * NOTE: Content files that import PNG/JPG assets via Vite (hero.js, about.js,
 * audio.js, posts.js, gallery.js) cannot be loaded in Node.js without a
 * bundler transform. Those modules are tested indirectly via their utility
 * functions and schema checks in other test files. Only pure-JS content
 * modules are imported here.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { socialsContent } from '../src/content/socials.js';
import { eventsContent, concertNotificationsConfig } from '../src/content/events.js';
import { testimonialsContent } from '../src/content/testimonials.js';
import { faqsContent } from '../src/content/faqs.js';
import { videosContent } from '../src/content/videos.js';
import { sectionConfig } from '../src/content/sectionConfig.js';

// ─── Socials ─────────────────────────────────────────────────────────────────
describe('Socials Content', () => {
  it('exports socialsContent with all required platform links', () => {
    assert.ok(socialsContent, 'socialsContent must be exported');
    assert.ok(typeof socialsContent.youtube === 'string' && socialsContent.youtube.startsWith('https://'), 'youtube link required');
    assert.ok(typeof socialsContent.instagram === 'string' && socialsContent.instagram.startsWith('https://'), 'instagram link required');
    assert.ok(typeof socialsContent.facebook === 'string' && socialsContent.facebook.startsWith('https://'), 'facebook link required');
    assert.ok(typeof socialsContent.spotify === 'string' && socialsContent.spotify.startsWith('https://'), 'spotify link required');
    assert.ok(typeof socialsContent.email === 'string' && socialsContent.email.includes('@'), 'email required and valid');
  });

  it('YouTube channel URL is correct (no typos)', () => {
    assert.strictEqual(
      socialsContent.youtube,
      'https://www.youtube.com/@muralidharshenoykochi',
      'YouTube channel URL must be exact'
    );
  });

  it('YouTube handle matches the channel URL', () => {
    assert.ok(
      socialsContent.youtube.includes(socialsContent.youtubeHandle.replace('@', '')),
      'youtubeHandle must match what is in the youtube URL'
    );
  });

  it('YouTube subscribe URL includes sub_confirmation parameter', () => {
    assert.ok(
      socialsContent.youtubeSubscribe.includes('sub_confirmation=1'),
      'Subscribe URL must include sub_confirmation=1'
    );
    assert.ok(
      socialsContent.youtubeSubscribe.includes('@muralidharshenoykochi'),
      'Subscribe URL must target correct channel'
    );
  });

  it('booking email is the official one', () => {
    assert.strictEqual(socialsContent.email, 'booking.muralidharshenoy@gmail.com');
  });
});

// ─── Events / Concerts ────────────────────────────────────────────────────────
describe('Events Content', () => {
  it('exports eventsContent as an array', () => {
    assert.ok(Array.isArray(eventsContent), 'eventsContent must be an array');
  });

  it('every event has required fields', () => {
    for (const event of eventsContent) {
      assert.ok(event.id !== undefined, 'event.id required');
      assert.ok(typeof event.title === 'string' && event.title.length > 0, `event.title missing for id ${event.id}`);
      assert.ok(typeof event.venue === 'string', `event.venue missing for id ${event.id}`);
      assert.ok(typeof event.city === 'string', `event.city missing for id ${event.id}`);
      // Must have at least one form of date
      const hasDate = event.date || event.formattedDate;
      assert.ok(hasDate, `Event "${event.title}" must have a date or formattedDate`);
    }
  });

  it('no duplicate event IDs', () => {
    const ids = eventsContent.map(e => e.id);
    const unique = new Set(ids);
    assert.strictEqual(ids.length, unique.size, 'All event IDs must be unique');
  });

  it('ticketed events have a ticketUrl string', () => {
    for (const event of eventsContent) {
      if (event.ticketed === true) {
        assert.ok(typeof event.ticketUrl === 'string', `Ticketed event "${event.title}" must have a ticketUrl`);
      }
    }
  });
});

// ─── Concert Notifications Config ─────────────────────────────────────────────
describe('Concert Notifications Config', () => {
  it('exports concertNotificationsConfig with required fields', () => {
    assert.ok(concertNotificationsConfig, 'concertNotificationsConfig must be exported');
    assert.ok(typeof concertNotificationsConfig.enabled === 'boolean', 'enabled must be boolean');
    assert.ok(typeof concertNotificationsConfig.formUrl === 'string' && concertNotificationsConfig.formUrl.startsWith('https://'), 'formUrl must be a valid URL');
    assert.ok(typeof concertNotificationsConfig.buttonText === 'string' && concertNotificationsConfig.buttonText.length > 0, 'buttonText required');
    assert.ok(typeof concertNotificationsConfig.title === 'string' && concertNotificationsConfig.title.length > 0, 'title required');
    assert.ok(typeof concertNotificationsConfig.description === 'string' && concertNotificationsConfig.description.length > 0, 'description required');
  });

  it('formUrl points to the correct Google Form', () => {
    assert.ok(
      concertNotificationsConfig.formUrl.includes('1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI'),
      'formUrl must reference the correct Google Form ID'
    );
  });
});

// ─── Testimonials ─────────────────────────────────────────────────────────────
describe('Testimonials Content', () => {
  it('exports testimonialsContent as a non-empty array', () => {
    assert.ok(Array.isArray(testimonialsContent) && testimonialsContent.length > 0, 'testimonialsContent must be non-empty');
  });

  it('every testimonial has quote, name, and role', () => {
    for (const t of testimonialsContent) {
      assert.ok(typeof t.quote === 'string' && t.quote.length > 20, 'quote must be a meaningful string');
      assert.ok(typeof t.name === 'string' && t.name.length > 0, 'testimonial name required');
      assert.ok(typeof t.role === 'string' && t.role.length > 0, 'testimonial role required');
    }
  });
});

// ─── FAQs ─────────────────────────────────────────────────────────────────────
describe('FAQs Content', () => {
  it('exports faqsContent as a non-empty array', () => {
    assert.ok(Array.isArray(faqsContent) && faqsContent.length > 0, 'faqsContent must be non-empty');
  });

  it('every FAQ has a question (q) and answer (a)', () => {
    for (const faq of faqsContent) {
      assert.ok(typeof faq.q === 'string' && faq.q.trim().length > 10, 'FAQ question (q) must be a meaningful string');
      assert.ok(typeof faq.a === 'string' && faq.a.trim().length > 10, 'FAQ answer (a) must be a meaningful string');
    }
  });
});

// ─── Videos Content ───────────────────────────────────────────────────────────
describe('Videos Content (YouTube Sync)', () => {
  it('exports videosContent as a non-empty array', () => {
    assert.ok(Array.isArray(videosContent) && videosContent.length > 0, 'videosContent must be a non-empty array');
  });

  it('contains both Videos and Shorts', () => {
    const hasVideos = videosContent.some(v => v.type === 'Video');
    const hasShorts = videosContent.some(v => v.type === 'Short');
    assert.ok(hasVideos, 'videosContent must contain at least one Video');
    assert.ok(hasShorts, 'videosContent must contain at least one Short');
  });

  it('every item has required YouTube schema fields', () => {
    for (const v of videosContent) {
      assert.ok(typeof v.id === 'string', `item.id required, missing in: ${JSON.stringify(v)}`);
      assert.ok(typeof v.videoId === 'string' && v.videoId.length > 0, `item.videoId required`);
      assert.ok(typeof v.title === 'string' && v.title.length > 0, `item.title required for ${v.videoId}`);
      assert.ok(typeof v.type === 'string' && ['Video', 'Short'].includes(v.type), `item.type must be Video or Short for ${v.videoId}`);
      assert.ok(typeof v.platform === 'string', `item.platform required for ${v.videoId}`);
      assert.ok(typeof v.url === 'string' && v.url.startsWith('https://'), `item.url must be a valid URL for ${v.videoId}`);
      assert.ok(typeof v.thumbnail === 'string' && v.thumbnail.startsWith('https://'), `item.thumbnail must be a valid URL for ${v.videoId}`);
      assert.ok(typeof v.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.date), `item.date must be YYYY-MM-DD for ${v.videoId}`);
    }
  });

  it('is sorted chronologically descending (newest first)', () => {
    for (let i = 0; i < videosContent.length - 1; i++) {
      const a = new Date(videosContent[i].date);
      const b = new Date(videosContent[i + 1].date);
      assert.ok(a >= b, `videosContent out of order at index ${i}: ${videosContent[i].date} should be >= ${videosContent[i + 1].date}`);
    }
  });

  it('no duplicate videoIds', () => {
    const ids = videosContent.map(v => v.videoId);
    const unique = new Set(ids);
    assert.strictEqual(ids.length, unique.size, 'All videoIds in videosContent must be unique');
  });

  it('Video URLs use watch?v= and Short URLs use /shorts/', () => {
    for (const v of videosContent) {
      if (v.type === 'Video') {
        assert.ok(v.url.includes('watch?v=') || v.url.includes('youtube.com'), `Video URL format invalid: ${v.url}`);
      } else if (v.type === 'Short') {
        assert.ok(v.url.includes('/shorts/') || v.url.includes('youtube.com'), `Short URL format invalid: ${v.url}`);
      }
    }
  });
});

// ─── Section Config ───────────────────────────────────────────────────────────
describe('Section Config', () => {
  const REQUIRED_SECTION_IDS = ['hero', 'about', 'posts', 'music', 'events', 'socials', 'gallery', 'testimonials', 'enquiry'];

  it('exports sectionConfig as a non-empty array', () => {
    assert.ok(Array.isArray(sectionConfig) && sectionConfig.length > 0, 'sectionConfig must be non-empty');
  });

  it('contains all required sections', () => {
    const ids = sectionConfig.map(s => s.id);
    for (const requiredId of REQUIRED_SECTION_IDS) {
      assert.ok(ids.includes(requiredId), `Section "${requiredId}" is missing from sectionConfig`);
    }
  });

  it('every section has id, name, and enabled fields', () => {
    for (const section of sectionConfig) {
      assert.ok(typeof section.id === 'string' && section.id.length > 0, 'section.id required');
      assert.ok(typeof section.name === 'string' && section.name.length > 0, 'section.name required');
      assert.ok(typeof section.enabled === 'boolean', `section.enabled must be boolean for section "${section.id}"`);
    }
  });

  it('no duplicate section IDs', () => {
    const ids = sectionConfig.map(s => s.id);
    const unique = new Set(ids);
    assert.strictEqual(ids.length, unique.size, 'All section IDs must be unique');
  });

  it('all core sections are enabled by default', () => {
    for (const id of REQUIRED_SECTION_IDS) {
      const section = sectionConfig.find(s => s.id === id);
      assert.ok(section?.enabled === true, `Section "${id}" should be enabled by default`);
    }
  });
});
