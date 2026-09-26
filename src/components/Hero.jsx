import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Hero({ onOpenBooking }) {
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

  return (
    <section className="relative min-h-[88vh] flex flex-col justify-end pt-32 pb-20 overflow-hidden bg-black">
      
      {/* Background Artist Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={siteConfig.artist.heroImage}
          alt={siteConfig.artist.name}
          className="w-full h-full object-cover object-center md:object-right opacity-80 filter brightness-105"
        />
        {/* Horizontal Black Gradient: 100% on left -> 10% by mid way (50%) -> transparent on right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10 w-full"
      >
        
        {/* Artist Name Header */}
        <motion.h1
          variants={itemVariants}
          className="font-sans text-5xl sm:text-7xl lg:text-9xl font-extrabold tracking-tight text-white mb-3 leading-none"
        >
          Muralidhar<br />Shenoy
        </motion.h1>

        {/* Title Tagline */}
        <motion.p
          variants={itemVariants}
          className="text-xl sm:text-3xl font-medium text-gray-200 mb-10 tracking-tight max-w-4xl"
        >
          {siteConfig.artist.title}
        </motion.p>

        {/* Prominent Action Button */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
          
          {/* Booking Enquiry Action Pill */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onOpenBooking}
            className="bg-white hover:bg-gray-200 text-black font-extrabold px-9 py-4 rounded-full text-base transition-all shadow-2xl flex items-center gap-2"
          >
            <span>Booking Enquiry</span>
            <ChevronRight className="w-5 h-5 text-black" />
          </motion.button>
        </motion.div>

      </motion.div>
    </section>
  );
}
