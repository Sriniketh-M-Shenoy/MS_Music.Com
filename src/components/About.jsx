import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Music, ChevronRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function About({ onOpenBooking }) {
  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <h2 className="font-sans text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            About Me
          </h2>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Portrait Image Bento Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 apple-bento p-2.5 sm:p-3 relative overflow-hidden group min-h-[320px] sm:min-h-[480px]"
          >
            <img
              src={siteConfig.artist.portraitImage}
              alt={siteConfig.artist.name}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40 pointer-events-none" />
          </motion.div>

          {/* Biography & Capabilities Bento Box */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="apple-bento p-6 sm:p-10 space-y-5 sm:space-y-6"
            >
              <h3 className="font-sans text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Musical Journey & Artistry
              </h3>

              {siteConfig.artist.aboutParagraphs.map((paragraph, index) => (
                <p key={index} className="text-gray-300 text-sm sm:text-base leading-relaxed font-normal">
                  {paragraph}
                </p>
              ))}
            </motion.div>

            {/* Quick Cards Grid: Musical Range & Corporate Background */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="apple-bento p-6"
              >
                <div className="flex items-center gap-2 text-amber-400 text-[11px] font-mono tracking-[0.2em] uppercase mb-3 font-semibold">
                  <Music className="w-4 h-4" />
                  <span>Musical Focus</span>
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  Devotional, Light & Classical Music
                </p>
                <p className="text-xs text-gray-400">
                  Playback Singer & Music Composer across Indian languages.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="apple-bento p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-[11px] font-mono tracking-[0.2em] uppercase mb-3 font-semibold">
                    <Briefcase className="w-4 h-4" />
                    <span>Corporate Background</span>
                  </div>
                  <p className="text-xs text-white font-medium mb-1">
                    Retired as Vice President – Sales
                  </p>
                  <p className="text-[11px] text-gray-400 font-mono">
                    Canara Robeco Mutual Fund, Mangalore
                  </p>
                </div>

                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={onOpenBooking}
                  className="mt-4 text-xs font-semibold text-white hover:text-amber-300 flex items-center gap-1 group"
                >
                  <span>Request concert availability</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
