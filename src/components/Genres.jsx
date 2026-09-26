import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Genres() {
  const [activeGenreId, setActiveGenreId] = useState(siteConfig.genres[0].id);
  const activeGenre = siteConfig.genres.find(g => g.id === activeGenreId) || siteConfig.genres[0];

  return (
    <section id="genres" className="py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase font-mono tracking-widestApple text-amber-400 block mb-3 font-semibold">
            REPERTOIRE
          </span>
          <h2 className="font-sans text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            Vocal performance genres. Crafted to perfection.
          </h2>
          <p className="text-gray-400 text-base">
            Select a genre below to explore performance highlights.
          </p>
        </motion.div>

        {/* Bento Grid 4-Column Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {siteConfig.genres.map((genre) => {
            const isActive = genre.id === activeGenreId;
            return (
              <motion.button
                key={genre.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveGenreId(genre.id)}
                className={`text-left p-6 apple-bento relative transition-all duration-300 ${
                  isActive
                    ? 'border-amber-400/80 bg-white/[0.08] shadow-2xl'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest bg-white/10 text-amber-300 px-2.5 py-1 rounded-full border border-white/10">
                    {genre.badge}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="w-2 h-2 rounded-full bg-amber-400"
                    />
                  )}
                </div>

                <h3 className="font-sans text-2xl font-bold text-white mb-1">
                  {genre.title}
                </h3>
                <p className="text-xs text-gray-400">
                  {genre.subtitle}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Genre Bento Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeGenre.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="apple-bento p-8 sm:p-12 border border-white/15 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 border border-amber-400/30 px-3 py-1 rounded-full">
                  Featured Specialty
                </span>
                <h3 className="font-sans text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {activeGenre.title} — {activeGenre.subtitle}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed font-normal">
                  {activeGenre.description}
                </p>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-xs uppercase font-mono tracking-widest text-gray-400 mb-4">
                    Signature Performance Elements:
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {activeGenre.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="text-xs text-gray-200">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="h-72 rounded-2xl overflow-hidden relative border border-white/10 group">
                  <img
                    src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80"
                    alt={activeGenre.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs font-mono text-gray-300">
                      Live Stage Performance • {activeGenre.title}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
