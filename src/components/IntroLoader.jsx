import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import signatureSigningGif from '../assets/branding/MS_signature_signing.gif';

export default function IntroLoader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const timersRef = useRef([]);

  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth < 768 || 
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')
  );

  // Preload signature gif to ensure playback starts smoothly from frame 0
  useEffect(() => {
    const img = new Image();
    img.src = signatureSigningGif;
    if (img.complete) {
      setIsImageLoaded(true);
    } else {
      img.onload = () => setIsImageLoaded(true);
      img.onerror = () => setIsImageLoaded(true); // Fallback so intro never hangs
    }
  }, []);

  // Start the duration countdown ONLY after the signature GIF has successfully loaded into memory
  useEffect(() => {
    if (!isImageLoaded) return;

    // Mobile browsers (iOS Safari, Android Chrome) play GIFs at ~30fps (~33ms/frame).
    // With 82 frames + internal pauses, mobile playback requires ~3.4s - 3.8s to fully sign.
    // Desktop Chrome/Safari plays at ~50fps (~2.25s) + 650ms hold on the finished signature = 2.9s.
    const exitDuration = isMobile ? 3800 : 2900;
    const completionDuration = exitDuration + 600;

    const timer = setTimeout(() => {
      setIsExiting(true);
    }, exitDuration);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, completionDuration);

    timersRef.current = [timer, completeTimer];

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [isImageLoaded, isMobile, onComplete]);

  const handleSkip = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-6 select-none overflow-hidden"
        >
          {/* Centered Signature GIF */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isImageLoaded ? 1 : 0, scale: isImageLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center max-w-2xl w-full"
          >
            <img
              src={signatureSigningGif}
              alt="Muralidhar Shenoy Signature"
              onLoad={() => setIsImageLoaded(true)}
              className="w-72 sm:w-96 md:w-[480px] max-w-[90vw] h-auto object-contain"
            />
          </motion.div>

          {/* Explicit Skip Option with generous touch target */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="absolute bottom-6 right-6 text-[11px] sm:text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-white px-4 py-2 rounded-full border border-white/15 hover:border-white/30 bg-black/60 hover:bg-white/10 backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            Skip ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
