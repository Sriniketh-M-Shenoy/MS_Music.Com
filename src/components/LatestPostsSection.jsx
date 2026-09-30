import React from 'react';
import { motion } from 'framer-motion';
import { Youtube, Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';
import { resolveImageSrc } from '../utils/resolveImageSrc';

export default function LatestPostsSection() {
  const siteConfig = useSiteConfig();
  const getIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      default: return <Facebook className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBadgeStyle = (platform) => {
    switch (platform.toLowerCase()) {
      case 'youtube': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'instagram': return 'bg-pink-500/20 text-pink-400 border-pink-500/40';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <section id="posts" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2 sm:mb-3 font-semibold">
            OFFICIAL MEDIA & SOCIAL FEEDS
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Latest Posts & Releases
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Authentic covers, devotional Haribhajans, and live concert highlights from YouTube ({siteConfig.artist.youtubeHandle}), Instagram, and Facebook.
          </p>
        </motion.div>

        {/* Bento Post Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteConfig.latestPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -8 }}
              className="apple-bento overflow-hidden border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div className="h-60 overflow-hidden relative bg-neutral-950">
                <img
                  src={resolveImageSrc(post.thumbnail)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />

                {/* Hover Play / View Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                    {getIcon(post.platform)}
                    <span className="font-mono text-[11px] text-amber-300 font-semibold">{post.handle}</span>
                  </div>

                  <h3 className="font-sans text-xl font-bold text-white leading-snug group-hover:text-amber-300 transition-colors mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed font-normal">
                    {post.description}
                  </p>
                </div>

                {/* Action Tile Link */}
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white/10 hover:bg-white text-white hover:text-black font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-white/10 shadow-lg"
                >
                  <span>{post.actionText}</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
