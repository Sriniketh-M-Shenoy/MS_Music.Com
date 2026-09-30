import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, Music2 } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';
import { resolveImageSrc } from '../utils/resolveImageSrc';

export default function MusicShowcase() {
  const siteConfig = useSiteConfig();
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const filteredTracks = selectedLanguage === 'All'
    ? siteConfig.audioTracks
    : siteConfig.audioTracks.filter(t => t.language.toLowerCase() === selectedLanguage.toLowerCase());

  const filterLanguages = ['All', 'Kannada', 'Hindi', 'Konkani', 'Malayalam'];

  return (
    <section id="showcase" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-xs uppercase font-mono tracking-widestApple text-amber-400 block mb-2 sm:mb-3 font-semibold">
            SPOTIFY AUDIO SHOWCASE
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            Listen to studio tracks & live performances.
          </h2>
        </motion.div>

        {/* Embedded Official Spotify Artist Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="apple-bento p-5 sm:p-8 rounded-3xl mb-12 sm:mb-16 border border-white/15 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center text-black flex-shrink-0">
                <Music2 className="w-5 h-5 fill-black" />
              </div>
              <div>
                <h3 className="font-sans text-lg sm:text-xl font-bold text-white tracking-tight">
                  Official Spotify Artist Player
                </h3>
                <p className="text-xs text-gray-400">
                  Stream high quality audio directly from Spotify
                </p>
              </div>
            </div>

            <a
              href={siteConfig.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Listen on Spotify Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10">
            <iframe
              style={{ borderRadius: '16px' }}
              src="https://open.spotify.com/embed/artist/0oEpNPAtIRZ1ReC28uqhdT?utm_source=generator&theme=0"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Muralidhar Shenoy Spotify Player"
            />
          </div>
        </motion.div>

        {/* Audio Track Selector Grid linking to Spotify */}
        <div className="mb-16 sm:mb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                Featured Audio Repertoire
              </h3>
              <p className="text-xs text-gray-400">
                Click any track to listen directly on Spotify
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
              {filterLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`text-xs px-4 py-1.5 rounded-full transition-all flex-shrink-0 ${
                    selectedLanguage === lang
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTracks.map((track) => (
              <motion.a
                key={track.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                href={track.spotifyUrl || siteConfig.socials.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="apple-bento p-5 border border-white/10 hover:border-[#1DB954]/50 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/10">
                    <img src={resolveImageSrc(track.coverImage)} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Music2 className="w-5 h-5 text-[#1DB954]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-white group-hover:text-[#1DB954] transition-colors">
                      {track.title}
                    </h4>
                    <p className="text-xs text-gray-400">
                      {track.genre} • <span className="text-amber-400/90 font-medium">{track.language}</span>
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#1DB954]/10 text-[#1DB954] group-hover:bg-[#1DB954] group-hover:text-black flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
