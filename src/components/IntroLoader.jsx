import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import signatureSigningGif from '../assets/branding/MS_signature_signing.gif';

export default function IntroLoader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 2.6s matches the 1.3x accelerated GIF duration perfectly
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2600);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3300);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
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
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#070709] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
          onClick={handleSkip}
        >
          {/* Apple-style Subtle Radial Ambient Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-amber-500/10 blur-[100px] animate-pulse" />
          </div>

          {/* Central Signature Container */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-4 sm:p-8 flex items-center justify-center"
            >
              <img
                src={signatureSigningGif}
                alt="Muralidhar Shenoy Signature Signing"
                className="w-64 sm:w-80 md:w-96 max-w-[85vw] h-auto object-contain filter drop-shadow-[0_0_30px_rgba(245,158,11,0.25)] brightness-110"
              />
            </motion.div>

            {/* Typography Reveal */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 mt-2 sm:mt-4"
            >
              <div className="inline-block">
                <span className="font-mono text-[10px] sm:text-xs font-bold tracking-[0.35em] sm:tracking-[0.45em] uppercase text-zinc-300 block">
                  MURALIDHAR SHENOY
                </span>
                <span className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent block mt-1.5" />
              </div>

              <p className="text-[10px] sm:text-[11px] font-sans tracking-[0.2em] uppercase text-amber-400/80 font-medium">
                Classical & Contemporary Vocalist
              </p>
            </motion.div>
          </div>

          {/* Discreet Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            whileHover={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 text-[11px] font-mono tracking-widest uppercase text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 bg-white/5 transition-all cursor-pointer"
          >
            Skip ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
