import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ExternalLink, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { incrementCounter } from '../utils/metrics';
import { formatConcertFormEmbedUrl } from '../utils/concerts';

export { formatConcertFormEmbedUrl };

export default function ConcertNotificationsModal({ isOpen, onClose, config }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const rawUrl = config?.formUrl || 'https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/preview';
  const embedUrl = formatConcertFormEmbedUrl(rawUrl);
  const directUrl = config?.directFormUrl || rawUrl.replace('/preview', '/viewform');

  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
      incrementCounter('concert_notifications_modal_opens');
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-3xl bg-zinc-950 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="px-5 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-amber-950/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-extrabold text-amber-400">
                    {config?.badgeText || 'CONCERT ALERTS'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Official Form
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {config?.title || 'Concert Notifications & Tour Updates'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all"
                title="Open in new window"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subtitle / Description bar */}
          <div className="px-5 sm:px-6 py-2.5 bg-zinc-900/60 border-b border-white/5 text-xs text-zinc-400">
            {config?.description || 'Sign up below to receive email notifications and tour updates when Muralidhar Shenoy announces new live concerts, acoustic evenings, and ticket releases.'}
          </div>

          {/* Form Container with Loading State */}
          <div className="relative flex-grow min-h-[500px] sm:min-h-[560px] bg-zinc-950 overflow-hidden">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 z-10 text-zinc-400">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                <span className="text-xs font-mono text-zinc-500">Loading Google Form...</span>
              </div>
            )}

            <iframe
              src={embedUrl}
              title="Concert Notifications Google Form"
              className="w-full h-full min-h-[500px] sm:min-h-[560px] border-0"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>

          {/* Footer note */}
          <div className="px-5 py-3 border-t border-white/10 bg-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
            <span>Your information is kept private and used only for official concert alerts.</span>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:underline sm:hidden"
            >
              <span>Open in tab</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
