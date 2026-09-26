import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import LatestPostsSection from './components/LatestPostsSection';
import MusicShowcase from './components/MusicShowcase';
import EventSchedule from './components/EventSchedule';
import Gallery from './components/Gallery';
import SocialsSection from './components/SocialsSection';
import Testimonials from './components/Testimonials';
import EnquirySection from './components/EnquirySection';
import Footer from './components/Footer';

export default function App() {
  const handleOpenBooking = () => {
    const enquireSection = document.getElementById('enquire');
    if (enquireSection) {
      enquireSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black antialiased overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar onOpenBooking={handleOpenBooking} />

      {/* Main Sections */}
      <main className="flex-grow">
        <Hero onOpenBooking={handleOpenBooking} />
        <About onOpenBooking={handleOpenBooking} />
        <LatestPostsSection />
        <MusicShowcase />
        <EventSchedule onOpenBooking={handleOpenBooking} />
        <SocialsSection />
        <Gallery />
        <Testimonials />
        <EnquirySection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
