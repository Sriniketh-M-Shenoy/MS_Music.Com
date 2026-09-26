import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeImage, setActiveImage] = useState(null);

  const categories = ['All', 'Concerts', 'Studio', 'Festival', 'Devotional'];

  const filteredGallery = selectedCategory === 'All'
    ? siteConfig.gallery
    : siteConfig.gallery.filter(item => item.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="gallery" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-xs uppercase font-mono tracking-widestApple text-amber-400 block mb-2 sm:mb-3 font-semibold">
            VISUAL GALLERY
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            Moments captured on stage and in the studio.
          </h2>
        </motion.div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 mb-8 sm:mb-12 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full font-medium transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bento Gallery Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredGallery.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                onClick={() => setActiveImage(item)}
                className="apple-bento overflow-hidden group cursor-pointer border border-white/10 hover:border-white/30 transition-all relative flex flex-col justify-between"
              >
                <div className="h-56 sm:h-72 overflow-hidden relative">
                  <img
                    src={item.url}
                    alt={item.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-black">
                  <p className="font-sans text-sm sm:text-base font-semibold text-white">
                    {item.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activeImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6"
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 text-white hover:text-gray-300 p-2.5 sm:p-3 bg-white/10 rounded-full border border-white/20 transition-colors z-10"
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-5xl w-full apple-bento p-3 sm:p-4 border border-white/20 overflow-hidden"
              >
                <img
                  src={activeImage.url}
                  alt={activeImage.caption}
                  className="w-full max-h-[65vh] sm:max-h-[75vh] object-contain rounded-2xl mb-3 sm:mb-4"
                />
                <div className="text-center p-2 sm:p-4">
                  <h3 className="font-sans text-lg sm:text-2xl font-bold text-white">
                    {activeImage.caption}
                  </h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
