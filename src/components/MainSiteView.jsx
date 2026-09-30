import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import LatestPostsSection from './LatestPostsSection';
import MusicShowcase from './MusicShowcase';
import EventSchedule from './EventSchedule';
import Gallery from './Gallery';
import SocialsSection from './SocialsSection';
import Testimonials from './Testimonials';
import EnquirySection from './EnquirySection';
import CustomSection from './CustomSection';
import Footer from './Footer';
import { SiteConfigContext, siteConfig as defaultSiteConfig } from '../config/siteConfig';

function getLiveDraft() {
  try {
    const saved = typeof window !== 'undefined' && localStorage.getItem('ms_studio_draft');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return null;
}

export default function MainSiteView({ customSectionConfig, customContent }) {
  const [draftState, setDraftState] = React.useState(() => getLiveDraft());

  React.useEffect(() => {
    const handleDraftUpdate = () => {
      setDraftState(getLiveDraft());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleDraftUpdate);
      window.addEventListener('ms_draft_updated', handleDraftUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleDraftUpdate);
        window.removeEventListener('ms_draft_updated', handleDraftUpdate);
      }
    };
  }, []);

  const handleOpenBooking = () => {
    const enquireSection = document.getElementById('enquire');
    if (enquireSection) {
      enquireSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const effectiveContent = customContent || draftState;

  const currentConfig = customSectionConfig || effectiveContent?.sectionConfig || defaultSiteConfig.sectionConfig || [
    { id: 'hero', name: 'Hero Banner', enabled: true },
    { id: 'about', name: 'About Artist', enabled: true },
    { id: 'posts', name: 'Latest Posts', enabled: true },
    { id: 'music', name: 'Music Showcase', enabled: true },
    { id: 'events', name: 'Concert Schedule', enabled: true },
    { id: 'socials', name: 'Social Channels', enabled: true },
    { id: 'gallery', name: 'Photo Gallery', enabled: true },
    { id: 'testimonials', name: 'Testimonials', enabled: true },
    { id: 'enquiry', name: 'Booking Enquiry', enabled: true }
  ];

  // Dynamically derive active site configuration if custom studio content is passed or retrieved from draft
  const activeSiteConfig = {
    ...(effectiveContent ? {
      artist: {
        ...(effectiveContent.hero || defaultSiteConfig.artist || {}),
        ...(effectiveContent.about || {}),
        verifiedBadge: "Verified Artist",
        youtubeHandle: effectiveContent.socials?.youtubeHandle || defaultSiteConfig.artist?.youtubeHandle,
      },
      socials: effectiveContent.socials || defaultSiteConfig.socials,
      latestPosts: effectiveContent.posts || defaultSiteConfig.latestPosts,
      googleForm: {
        enabled: effectiveContent.socials ? (effectiveContent.socials.googleFormEnabled !== false) : defaultSiteConfig.googleForm.enabled,
        title: "Booking Enquiry & Performance Request",
        description: "Submit your event details via our official Google Form or email directly for custom concert programming.",
        embedUrl: effectiveContent.socials?.googleFormEmbedUrl || defaultSiteConfig.googleForm.embedUrl,
        directFormUrl: effectiveContent.socials?.googleFormDirectUrl || defaultSiteConfig.googleForm.directFormUrl,
        contactEmail: effectiveContent.socials?.email || defaultSiteConfig.socials.email
      },
      emailForm: {
        enabled: effectiveContent.socials ? (effectiveContent.socials.emailFormEnabled !== false) : (defaultSiteConfig.emailForm?.enabled !== false),
        contactEmail: effectiveContent.socials?.email || defaultSiteConfig.socials.email
      },
      audioTracks: effectiveContent.audio || defaultSiteConfig.audioTracks,
      events: effectiveContent.events || defaultSiteConfig.events,
      gallery: effectiveContent.gallery || defaultSiteConfig.gallery,
      testimonials: effectiveContent.testimonials || defaultSiteConfig.testimonials,
      faqs: effectiveContent.faqs || defaultSiteConfig.faqs
    } : defaultSiteConfig),
    sectionConfig: currentConfig
  };

  const builtInComponents = {
    hero: <Hero key="hero" onOpenBooking={handleOpenBooking} />,
    about: <About key="about" onOpenBooking={handleOpenBooking} />,
    posts: <LatestPostsSection key="posts" />,
    music: <MusicShowcase key="music" />,
    events: <EventSchedule key="events" onOpenBooking={handleOpenBooking} />,
    socials: <SocialsSection key="socials" />,
    gallery: <Gallery key="gallery" />,
    testimonials: <Testimonials key="testimonials" />,
    enquiry: <EnquirySection key="enquiry" />
  };

  const activeSections = currentConfig
    .filter(sec => sec.enabled !== false)
    .map(sec => builtInComponents[sec.id] || <CustomSection key={sec.id} section={sec} />);

  return (
    <SiteConfigContext.Provider value={activeSiteConfig}>
      <div className="min-h-screen bg-black text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black antialiased overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar onOpenBooking={handleOpenBooking} />

        {/* Main Website Content */}
        <main className="flex-grow">
          {activeSections.length > 0 ? activeSections : (
            <>
              <Hero onOpenBooking={handleOpenBooking} />
              <About onOpenBooking={handleOpenBooking} />
              <LatestPostsSection />
              <MusicShowcase />
              <EventSchedule onOpenBooking={handleOpenBooking} />
              <SocialsSection />
              <Gallery />
              <Testimonials />
              <EnquirySection />
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </SiteConfigContext.Provider>
  );
}
