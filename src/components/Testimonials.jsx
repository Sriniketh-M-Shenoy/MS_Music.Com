import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16"
        >
          <span className="text-xs uppercase font-mono tracking-widestApple text-amber-400 block mb-3 font-semibold">
            TESTIMONIALS
          </span>
          <h2 className="font-sans text-4xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            Praise from organizers & music lovers.
          </h2>
        </motion.div>

        {/* Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteConfig.testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -6 }}
              className="apple-bento p-8 flex flex-col justify-between border border-white/10"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="font-sans text-gray-200 text-base leading-relaxed mb-8">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-sans text-lg font-bold text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {item.role}
                  </p>
                </div>

                <span className="text-[10px] text-gray-500 font-mono uppercase">
                  {item.location}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
