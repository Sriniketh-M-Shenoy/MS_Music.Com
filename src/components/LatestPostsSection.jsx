import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Instagram, Facebook, Play, Eye, Calendar, Sparkles, ChevronDown } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';
import { resolveImageSrc } from '../utils/resolveImageSrc';
import VideoPlayerModal from './VideoPlayerModal';

export default function LatestPostsSection() {
  const siteConfig = useSiteConfig();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'videos' | 'shorts' | 'socials'
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combine YouTube videos & shorts with any standalone social posts
  const rawVideos = siteConfig.videos || [];
  const rawPosts = siteConfig.latestPosts || [];

  // Filter out duplicate YouTube entries from posts if they exist in videos
  const socialPosts = rawPosts.filter(p => p.platform?.toLowerCase() !== 'youtube');

  // Unified items list with sorting by date (newest first)
  const allMediaItems = [
    ...rawVideos.map(v => ({
      ...v,
      isYouTube: true,
      platform: 'YouTube'
    })),
    ...socialPosts.map(p => ({
      ...p,
      isYouTube: false,
      date: p.date || '2026-10-01'
    }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Apply active category filter
  const filteredItems = allMediaItems.filter(item => {
    if (activeFilter === 'videos') return item.isYouTube && item.type === 'Video';
    if (activeFilter === 'shorts') return item.isYouTube && item.type === 'Short';
    if (activeFilter === 'socials') return !item.isYouTube;
    return true; // 'all'
  });

  const displayedItems = filteredItems.slice(0, visibleCount);

  const handleCardClick = (item) => {
    if (item.isYouTube) {
      setSelectedVideo(item);
      setIsModalOpen(true);
    } else if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="posts" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2 sm:mb-3 font-semibold">
              OFFICIAL MEDIA & SOCIAL FEEDS
            </span>
            <h2 className="font-sans text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
              Latest Videos, Shorts & Posts
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              Explore authentic concert videos, viral YouTube Shorts, and devotional recitals from{' '}
              <a 
                href="https://www.youtube.com/@muralidharshenoykochi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-400 hover:underline font-mono"
              >
                @muralidharshenoykochi
              </a>
              . Click any video to watch in high definition right here.
            </p>
          </motion.div>

          {/* Interactive Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center gap-2 shrink-0 bg-white/5 p-1.5 rounded-2xl border border-white/10"
          >
            {[
              { id: 'all', label: 'All Media', count: allMediaItems.length },
              { id: 'videos', label: 'Videos', count: allMediaItems.filter(x => x.isYouTube && x.type === 'Video').length },
              { id: 'shorts', label: 'Shorts', count: allMediaItems.filter(x => x.isYouTube && x.type === 'Short').length },
              { id: 'socials', label: 'Social Feeds', count: socialPosts.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setVisibleCount(6);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-amber-400 text-black shadow-md font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeFilter === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayedItems.map((item, idx) => {
              const isShort = item.type === 'Short';
              const thumbnailSrc = item.thumbnail?.startsWith('http') 
                ? item.thumbnail 
                : resolveImageSrc(item.thumbnail);

              return (
                <motion.div
                  key={item.id || item.videoId || idx}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: (idx % 6) * 0.06 }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleCardClick(item)}
                  className="apple-bento group cursor-pointer overflow-hidden border border-white/10 hover:border-amber-500/40 bg-zinc-950 flex flex-col justify-between transition-all duration-300 shadow-xl rounded-2xl"
                >
                  {/* Thumbnail Container */}
                  <div className={`relative w-full overflow-hidden bg-black ${isShort ? 'aspect-[4/3] sm:aspect-square' : 'aspect-video'}`}>
                    <img
                      src={thumbnailSrc}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                    {/* Badge: Type & Platform */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {item.isYouTube ? (
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md ${
                          isShort 
                            ? 'bg-rose-500/90 text-white border border-rose-400/40' 
                            : 'bg-red-600/90 text-white border border-red-500/40'
                        }`}>
                          <Youtube className="w-3.5 h-3.5" />
                          {isShort ? 'Short' : 'Video'}
                        </span>
                      ) : item.platform?.toLowerCase() === 'instagram' ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white border border-pink-400/40 shadow-lg">
                          <Instagram className="w-3.5 h-3.5" />
                          <span>Instagram</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-600/90 text-white border border-blue-500/40 shadow-lg">
                          <Facebook className="w-3.5 h-3.5" />
                          <span>Facebook</span>
                        </span>
                      )}
                    </div>

                    {/* Play Button Overlay */}
                    {item.isYouTube && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Bottom Metadata Bar over Thumbnail */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                      {item.views && (
                        <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                          <Eye className="w-3 h-3 text-amber-400" />
                          {item.views}
                        </span>
                      )}
                      {(item.timeAgo || item.date) && (
                        <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-zinc-400">
                          <Calendar className="w-3 h-3" />
                          {item.timeAgo || item.date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-sans text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 group-hover:underline flex items-center gap-1 font-semibold">
                        {item.isYouTube ? '▶ Watch in Popup' : 'Open Post ↗'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {item.type || 'Media'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {visibleCount < filteredItems.length && (
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVisibleCount(prev => prev + 9)}
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs sm:text-sm font-bold px-6 py-3 rounded-2xl border border-white/15 hover:border-amber-400/50 transition-all cursor-pointer shadow-lg"
            >
              <span>Load More ({filteredItems.length - visibleCount} remaining)</span>
              <ChevronDown className="w-4 h-4 text-amber-400" />
            </motion.button>
          </div>
        )}

      </div>

      {/* Video Popup Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVideo(null);
        }}
      />
    </section>
  );
}
