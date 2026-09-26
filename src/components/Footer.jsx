import React from 'react';
import { Instagram, Facebook, Youtube, Settings, ArrowUp } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Footer({ onOpenConfigHelp }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/10 pt-12 sm:pt-20 pb-8 sm:pb-12 relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 pb-12 sm:pb-16 border-b border-white/10">
          
          <div className="sm:col-span-2 md:col-span-5 space-y-4">
            <span className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-white block">
              MS
            </span>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {siteConfig.artist.title}. Dedicated to preserving classical traditions and modern musical excellence.
            </p>

            <div className="flex items-center gap-3 pt-2">
              {siteConfig.socials.instagram && (
                <a
                  href={siteConfig.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteConfig.socials.facebook && (
                <a
                  href={siteConfig.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {siteConfig.socials.youtube && (
                <a
                  href={siteConfig.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#about" className="hover:text-white transition-colors">Overview</a></li>
              <li><a href="#posts" className="hover:text-white transition-colors">Posts</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors">Audio Showcase</a></li>
              <li><a href="#events" className="hover:text-white transition-colors">Concerts</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Gallery</a></li>
              <li><a href="#socials" className="hover:text-white transition-colors">Socials</a></li>
              <li><a href="#enquire" className="hover:text-white transition-colors">Booking Enquiry</a></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase font-mono tracking-widest text-amber-400 font-semibold">
              Enquiries & Booking
            </h4>
            <p className="text-xs text-gray-400">
              Email: <a href={`mailto:${siteConfig.socials.email}`} className="text-amber-300 hover:underline">{siteConfig.socials.email}</a>
            </p>
            
            <div className="pt-2">
              <button
                onClick={onOpenConfigHelp}
                className="text-xs text-amber-400 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Site Config Guide</span>
              </button>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MS. All Rights Reserved.</p>

          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
