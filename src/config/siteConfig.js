/**
 * SITE CONFIGURATION MASTER FILE
 * ==============================
 * Content is modularized under `src/content/` for easy editing and maintenance:
 * - src/content/hero.js
 * - src/content/about.js
 * - src/content/socials.js
 * - src/content/posts.js
 * - src/content/audio.js
 * - src/content/events.js
 * - src/content/gallery.js
 * - src/content/testimonials.js
 * - src/content/faqs.js
 */

import React, { createContext, useContext } from 'react';

import {
  heroContent,
  aboutContent,
  socialsContent,
  latestPostsContent,
  audioTracksContent,
  eventsContent,
  galleryContent,
  testimonialsContent,
  faqsContent
} from '../content';

export const siteConfig = {
  // 1. ARTIST OVERVIEW & IMAGES (from src/content/hero.js & src/content/about.js)
  artist: {
    ...heroContent,
    ...aboutContent,
    verifiedBadge: "Verified Artist",
    youtubeHandle: socialsContent.youtubeHandle,
  },

  // 2. SOCIAL MEDIA LINKS (from src/content/socials.js)
  socials: socialsContent,

  // 3. ACTUAL LATEST POSTS (from src/content/posts.js)
  latestPosts: latestPostsContent,

  // 4. GOOGLE FORM & BOOKING ENQUIRY CONFIGURATION
  googleForm: {
    enabled: socialsContent.googleFormEnabled !== false,
    title: "Booking Enquiry & Performance Request",
    description: "Submit your event details via our official Google Form or email directly for custom concert programming.",
    embedUrl: socialsContent.googleFormEmbedUrl || "https://docs.google.com/forms/d/e/1FAIpQLSf6l5M_fN5wiZL2p7vWhLEZQUXpDIkhxdhl2C-GKPNp5aQK1g/viewform?embedded=true", 
    directFormUrl: socialsContent.googleFormDirectUrl || "https://docs.google.com/forms/d/e/1FAIpQLSf6l5M_fN5wiZL2p7vWhLEZQUXpDIkhxdhl2C-GKPNp5aQK1g/viewform?pli=1",
    contactEmail: socialsContent.email
  },
  emailForm: {
    enabled: socialsContent.emailFormEnabled !== false,
    contactEmail: socialsContent.email
  },

  // 5. FEATURED AUDIO PREVIEW TRACKS (from src/content/audio.js)
  audioTracks: audioTracksContent,

  // 6. EVENTS & CONCERT SCHEDULE (from src/content/events.js)
  events: eventsContent,

  // 7. PHOTO GALLERY (from src/content/gallery.js)
  gallery: galleryContent,

  // 8. TESTIMONIALS (from src/content/testimonials.js)
  testimonials: testimonialsContent,

  // 9. FREQUENTLY ASKED QUESTIONS (from src/content/faqs.js)
  faqs: faqsContent
};

// React Context for live dynamic updates during studio editing & preview
export const SiteConfigContext = createContext(null);

export function useSiteConfig() {
  const custom = useContext(SiteConfigContext);
  return custom || siteConfig;
}

