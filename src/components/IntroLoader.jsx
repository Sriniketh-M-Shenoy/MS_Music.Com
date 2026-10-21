import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import signatureSigningGif from '../assets/branding/MS_signature_signing.gif';

export default function IntroLoader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 2.35s matches the accelerated 1.3x signature signing duration
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2350);

    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2900);

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
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-black flex items-center justify-center p-6 select-none overflow-hidden"
          onClick={handleSkip}
        >
          {/* Centered Pure Signature GIF Only - No Text, No Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center max-w-2xl w-full"
          >
            <img
              src={signatureSigningGif}
              alt="Muralidhar Shenoy Signature"
              className="w-72 sm:w-96 md:w-[480px] max-w-[90vw] h-auto object-contain"
            />
          </motion.div>

          {/* Discreet Skip Option */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            className="absolute bottom-6 right-6 text-[11px] font-mono tracking-widest uppercase text-zinc-500 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 transition-all cursor-pointer"
          >
            Skip ✕
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
