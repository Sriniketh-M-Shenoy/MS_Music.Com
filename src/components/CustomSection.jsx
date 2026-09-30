import React from 'react';
import { motion } from 'framer-motion';

export default function CustomSection({ section }) {
  if (!section) return null;
  const { id, name, description, content } = section;

  return (
    <section id={id} className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-8"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2 font-semibold">
            {name || "SECTION"}
          </span>
          <h2 className="font-sans text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            {name}
          </h2>
          {description && (
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="apple-bento p-6 sm:p-10 text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-line border border-white/10"
          >
            {content}
          </motion.div>
        )}
      </div>
    </section>
  );
}
