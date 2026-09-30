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

export default function MainSiteView({ customSectionConfig, customContent }) {
  const handleOpenBooking = () => {
    const enquireSection = document.getElementById('enquire');
    if (enquireSection) {
      enquireSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentConfig = customSectionConfig || defaultSiteConfig.sectionConfig || [
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

  // Dynamically derive active site configuration if custom studio content is passed
  const activeSiteConfig = {
    ...(customContent ? {
      artist: {
        ...(customContent.hero || defaultSiteConfig.artist || {}),
        ...(customContent.about || {}),
        verifiedBadge: "Verified Artist",
        youtubeHandle: customContent.socials?.youtubeHandle || defaultSiteConfig.artist?.youtubeHandle,
      },
      socials: customContent.socials || defaultSiteConfig.socials,
      latestPosts: customContent.posts || defaultSiteConfig.latestPosts,
      googleForm: {
        enabled: customContent.socials ? (customContent.socials.googleFormEnabled !== false) : defaultSiteConfig.googleForm.enabled,
        title: "Booking Enquiry & Performance Request",
        description: "Submit your event details via our official Google Form or email directly for custom concert programming.",
        embedUrl: customContent.socials?.googleFormEmbedUrl || defaultSiteConfig.googleForm.embedUrl,
        directFormUrl: customContent.socials?.googleFormDirectUrl || defaultSiteConfig.googleForm.directFormUrl,
        contactEmail: customContent.socials?.email || defaultSiteConfig.socials.email
      },
      emailForm: {
        enabled: customContent.socials ? (customContent.socials.emailFormEnabled !== false) : (defaultSiteConfig.emailForm?.enabled !== false),
        contactEmail: customContent.socials?.email || defaultSiteConfig.socials.email
      },
      audioTracks: customContent.audio || defaultSiteConfig.audioTracks,
      events: customContent.events || defaultSiteConfig.events,
      gallery: customContent.gallery || defaultSiteConfig.gallery,
      testimonials: customContent.testimonials || defaultSiteConfig.testimonials,
      faqs: customContent.faqs || defaultSiteConfig.faqs
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
