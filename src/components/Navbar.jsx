import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';
import { resolveImageSrc } from '../utils/resolveImageSrc';

export default function Navbar({ onOpenBooking }) {
  const siteConfig = useSiteConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const defaultNavHrefs = {
    hero: '#hero',
    about: '#about',
    posts: '#posts',
    music: '#showcase',
    events: '#events',
    gallery: '#gallery',
    socials: '#socials',
    testimonials: '#testimonials',
    enquiry: '#enquire'
  };

  const defaultShortNames = {
    hero: 'Home',
    about: 'About',
    posts: 'Posts',
    music: 'Music',
    events: 'Concerts',
    gallery: 'Gallery',
    socials: 'Socials',
    testimonials: 'Testimonials',
    enquiry: 'Enquiry'
  };

  const rawSections = siteConfig.sectionConfig || [
    { id: 'about', name: 'About', enabled: true },
    { id: 'posts', name: 'Posts', enabled: true },
    { id: 'music', name: 'Music', enabled: true },
    { id: 'events', name: 'Concerts', enabled: true },
    { id: 'gallery', name: 'Gallery', enabled: true },
    { id: 'socials', name: 'Socials', enabled: true },
    { id: 'enquiry', name: 'Enquiry', enabled: true }
  ];

  const navLinks = rawSections
    .filter(sec => sec.enabled !== false && sec.id !== 'hero')
    .map(sec => ({
      name: defaultShortNames[sec.id] || sec.name || sec.id,
      fullName: sec.name || sec.id,
      href: defaultNavHrefs[sec.id] || `#${sec.id}`
    }));

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10 py-3.5 shadow-2xl' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2 group shrink-0">
            {/* Desktop Brand Text */}
            <span className="hidden md:inline-block font-sans text-xs xs:text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-amber-300 transition-colors shrink-0">
              MURALIDHAR SHENOY
            </span>

            {/* Mobile Signature Logo (only for phone screens) */}
            <img
              src={resolveImageSrc(siteConfig.artist.signatureImage)}
              alt="Muralidhar Shenoy Signature"
              className="inline-block md:hidden h-7 sm:h-8 w-auto object-contain filter brightness-125 shrink-0"
            />
          </a>

          {/* Center Links */}
          <div className="hidden lg:flex items-center space-x-6 text-xs font-medium tracking-wide min-w-0 overflow-hidden">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-300 relative group py-1 whitespace-nowrap"
                title={link.fullName}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right Action Button & Signature */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <img
              src={resolveImageSrc(siteConfig.artist.signatureImage)}
              alt="Muralidhar Shenoy Signature"
              className="h-9 lg:h-11 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity shrink-0"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={onOpenBooking}
              className="bg-white hover:bg-gray-200 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap shrink-0"
            >
              Booking Enquiry
            </motion.button>
          </div>

          {/* Mobile / Tablet Toggle */}
          <div className="flex lg:hidden items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBooking}
              className="bg-white text-black px-3.5 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform whitespace-nowrap"
            >
              Enquiry
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-1.5 rounded-lg active:bg-white/10 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-black/95 border-b border-white/10 backdrop-blur-3xl px-6 py-6 space-y-4 overflow-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white text-lg font-medium border-b border-white/5 pb-2"
              >
                {link.fullName || link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
