import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';

export default function Hero({ onOpenBooking }) {
  const siteConfig = useSiteConfig();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const nameWords = (siteConfig.artist.name || "Muralidhar Shenoy").split(' ');

  return (
    <section className="relative min-h-[85vh] sm:min-h-[88vh] flex flex-col justify-end pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden bg-black">
      
      {/* Background Artist Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={siteConfig.artist.heroImage}
          alt={siteConfig.artist.name}
          className="w-full h-full object-cover object-[70%_center] md:object-right opacity-80 filter brightness-105"
        />
        {/* Horizontal Black Gradient */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
        {/* Mobile Gradient (Vertical & Horizontal overlay for maximum legibility on phones) */}
        <div
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.2) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 pointer-events-none" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-12 z-10 w-full"
      >
        {/* Artist Name Header */}
        <motion.h1
          variants={itemVariants}
          className="font-sans text-4xl xs:text-5xl sm:text-7xl lg:text-9xl font-extrabold tracking-tight text-white mb-3 leading-[1.05]"
        >
          {nameWords.map((word, i) => (
            <React.Fragment key={i}>
              {word}
              {i < nameWords.length - 1 && <br />}
            </React.Fragment>
          ))}
        </motion.h1>

        {/* Title Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-2xl lg:text-3xl font-medium text-gray-200 mb-8 sm:mb-10 tracking-tight max-w-4xl leading-snug"
        >
          {siteConfig.artist.tagline || siteConfig.artist.title}
        </motion.p>

        {/* Prominent Action Button */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
          
          {/* Booking Enquiry Action Pill */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onOpenBooking}
            className="w-full sm:w-auto bg-white hover:bg-gray-200 text-black font-extrabold px-7 py-3.5 sm:px-9 sm:py-4 rounded-full text-sm sm:text-base transition-all shadow-2xl flex items-center justify-center gap-2"
          >
            <span>{siteConfig.artist.bookingButtonText || "Booking Enquiry"}</span>
            <ChevronRight className="w-5 h-5 text-black" />
          </motion.button>
        </motion.div>

      </motion.div>
    </section>
  );
}

