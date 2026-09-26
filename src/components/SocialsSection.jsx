import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Facebook, Music2, BellRing, Disc3, ArrowUpRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function SocialsSection() {
  return (
    <section id="socials" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Eyebrow & Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2 sm:mb-3 font-semibold">
            OFFICIAL SOCIAL MEDIA & STREAMING
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Listen & Follow Across Platforms
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Stream on Spotify, subscribe on YouTube, and follow on Instagram and Facebook for live concert updates and official audio releases.
          </p>
        </motion.div>

        {/* Big High-Impact Social Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* 1. SPOTIFY CARD (Extra Large) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="apple-bento p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/50 via-black to-black relative overflow-hidden group min-h-[320px] sm:min-h-[360px]"
          >
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-15 group-hover:opacity-30 transition-opacity">
              <Disc3 className="w-32 h-32 sm:w-44 sm:h-44 text-emerald-500 animate-spin" style={{ animationDuration: '25s' }} />
            </div>

            <div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-[#1DB954] group-hover:text-black transition-all duration-300">
                <Music2 className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold block mb-2">
                Official Spotify Artist Profile
              </span>
              
              <h3 className="font-sans text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                Stream on Spotify
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8 sm:mb-10 max-w-lg">
                Listen to official classical ragas, Sugama Sangeetha (Light Music), and multi-lingual playback songs discography.
              </p>
            </div>

            {/* BIGGER SPOTIFY BUTTON */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={siteConfig.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-sm sm:text-lg transition-all"
            >
              <Music2 className="w-5 h-5 sm:w-6 sm:h-6 fill-black text-black" />
              <span>Listen on Spotify</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </motion.a>
          </motion.div>

          {/* 2. YOUTUBE CARD (Extra Large) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -8 }}
            className="apple-bento p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-2 border-red-500/40 bg-gradient-to-br from-red-950/40 via-black to-black relative overflow-hidden group min-h-[320px] sm:min-h-[360px]"
          >
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-15 group-hover:opacity-25 transition-opacity">
              <Youtube className="w-32 h-32 sm:w-44 sm:h-44 text-red-500" />
            </div>

            <div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                <Youtube className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-red-400 font-bold block mb-2">
                YouTube Channel
              </span>
              
              <h3 className="font-sans text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                Subscribe on YouTube
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8 sm:mb-10 max-w-lg">
                Watch full-length concert recordings, live stage recitals, and multi-lingual film song videos.
              </p>
            </div>

            {/* BIGGER YOUTUBE BUTTON */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={siteConfig.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-sm sm:text-lg transition-all"
            >
              <BellRing className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              <span>Subscribe on YouTube</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.a>
          </motion.div>

          {/* 3. INSTAGRAM CARD (Extra Large) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8 }}
            className="apple-bento p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-2 border-pink-500/40 bg-gradient-to-br from-pink-950/40 via-black to-black relative overflow-hidden group min-h-[320px] sm:min-h-[360px]"
          >
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-15 group-hover:opacity-25 transition-opacity">
              <Instagram className="w-32 h-32 sm:w-44 sm:h-44 text-pink-500" />
            </div>

            <div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-gradient-to-tr group-hover:from-pink-500 group-hover:to-amber-400 group-hover:text-black transition-all duration-300">
                <Instagram className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-pink-400 font-bold block mb-2">
                Official Instagram
              </span>

              <h3 className="font-sans text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                Follow @muralidhargshenoy
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8 sm:mb-10 max-w-lg">
                Get behind-the-scenes snippets, daily practice reels, performance photos, and event updates.
              </p>
            </div>

            {/* BIGGER INSTAGRAM BUTTON */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 hover:opacity-95 text-white font-extrabold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-sm sm:text-lg transition-all"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Follow on Instagram</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.a>
          </motion.div>

          {/* 4. FACEBOOK CARD (Extra Large) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8 }}
            className="apple-bento p-6 sm:p-10 lg:p-12 flex flex-col justify-between border-2 border-blue-500/40 bg-gradient-to-br from-blue-950/40 via-black to-black relative overflow-hidden group min-h-[320px] sm:min-h-[360px]"
          >
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-15 group-hover:opacity-25 transition-opacity">
              <Facebook className="w-32 h-32 sm:w-44 sm:h-44 text-blue-500" />
            </div>

            <div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Facebook className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>

              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-blue-400 font-bold block mb-2">
                Facebook Page
              </span>

              <h3 className="font-sans text-2xl sm:text-4xl font-extrabold text-white mb-3 sm:mb-4 tracking-tight">
                Connect on Facebook
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8 sm:mb-10 max-w-lg">
                Join concert announcements, community posts, event schedules, and live interactive sessions.
              </p>
            </div>

            {/* BIGGER FACEBOOK BUTTON */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={siteConfig.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 sm:py-5 px-6 sm:px-8 rounded-2xl shadow-2xl flex items-center justify-center gap-3 text-sm sm:text-lg transition-all"
            >
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Connect on Facebook</span>
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.a>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
