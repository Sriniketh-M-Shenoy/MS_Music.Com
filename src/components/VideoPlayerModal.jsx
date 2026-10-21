import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Youtube, Eye, Calendar, BellRing } from 'lucide-react';
import { incrementCounter, getLocalMediaClicks } from '../utils/metrics';

export default function VideoPlayerModal({ video, isOpen, onClose }) {
  const [clickCounts, setClickCounts] = useState(() => getLocalMediaClicks());

  useEffect(() => {
    const handleUpdate = () => {
      setClickCounts(getLocalMediaClicks());
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('ms_media_clicks_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ms_media_clicks_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      }
    };
  }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const isShort = video.type === 'Short';
  const subscribeUrl = 'https://www.youtube.com/@muralidharshenoykochi?sub_confirmation=1';

  const handleSubscribeClick = () => {
    incrementCounter('youtube_subscribe_clicks');
    incrementCounter('social_clicks_youtube');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full ${isShort ? 'max-w-md' : 'max-w-4xl'} bg-zinc-950 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-zinc-900/70">
            <div className="flex items-center gap-2.5 min-w-0 pr-3">
              <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                <Youtube className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 shrink-0">
                {isShort ? 'YouTube Short' : 'YouTube Video'}
              </span>
              <span className="text-xs text-zinc-400 truncate hidden md:inline">
                • {video.title}
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Subscribe Button in Header */}
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={subscribeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSubscribeClick}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                title="Subscribe to @muralidharshenoykochi on YouTube"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Subscribe</span>
              </motion.a>

              <a
                href={video.url || `https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="Open directly on YouTube"
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close video player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Player Frame */}
          <div className={`relative bg-black w-full ${isShort ? 'aspect-[9/16] max-h-[70vh] mx-auto' : 'aspect-video'}`}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Bottom Details Footer */}
          <div className="p-4 sm:p-5 bg-zinc-950/95 border-t border-white/10 space-y-3">
            <h3 className="font-sans text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
              {video.title}
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-1 border-t border-white/5">
              <div className="flex items-center gap-4">
                {(() => {
                  const videoKey = video.videoId || video.id || video.title;
                  const onSiteViews = clickCounts[videoKey] || 0;
                  return (
                    <span className="flex items-center gap-1.5 text-zinc-300 font-mono text-xs">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{video.views || `${onSiteViews} views`}</span>
                      {onSiteViews > 0 && video.views && (
                        <span className="text-amber-300 font-bold bg-amber-400/20 px-1.5 py-0.5 rounded text-[10px]">
                          +{onSiteViews} on site
                        </span>
                      )}
                    </span>
                  );
                })()}
                {(video.timeAgo || video.date) && (
                  <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-xs">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {video.timeAgo || video.date}
                  </span>
                )}
              </div>

              {/* Footer Channel Link & Direct Subscribe */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.youtube.com/@muralidharshenoykochi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-zinc-400 hover:text-amber-300 transition-colors hidden sm:inline"
                >
                  @muralidharshenoykochi
                </a>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={subscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSubscribeClick}
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow-md transition-all cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Subscribe on YouTube</span>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
