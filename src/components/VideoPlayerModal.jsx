import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Youtube, Eye, Calendar, Sparkles } from 'lucide-react';

export default function VideoPlayerModal({ video, isOpen, onClose }) {
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
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-zinc-900/60">
            <div className="flex items-center gap-2.5 min-w-0 pr-4">
              <div className="w-7 h-7 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                <Youtube className="w-4 h-4" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 shrink-0">
                {isShort ? 'YouTube Short' : 'YouTube Video'}
              </span>
              <span className="text-xs text-zinc-400 truncate hidden sm:inline">
                • {video.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={video.url || `https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
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
          <div className={`relative bg-black w-full ${isShort ? 'aspect-[9/16] max-h-[72vh] mx-auto' : 'aspect-video'}`}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>

          {/* Bottom Details Footer */}
          <div className="p-4 sm:p-5 bg-zinc-950/90 border-t border-white/10 space-y-2">
            <h3 className="font-sans text-sm sm:text-base font-bold text-white line-clamp-2">
              {video.title}
            </h3>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-4">
                {video.views && (
                  <span className="flex items-center gap-1 text-zinc-300 font-mono text-[11px]">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    {video.views}
                  </span>
                )}
                {(video.timeAgo || video.date) && (
                  <span className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    {video.timeAgo || video.date}
                  </span>
                )}
              </div>

              <a
                href={video.url || `https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="sm:hidden inline-flex items-center gap-1.5 text-xs text-red-400 font-semibold"
              >
                <span>Open in YouTube app</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
