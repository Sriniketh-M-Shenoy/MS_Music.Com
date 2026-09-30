import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, MapPin, Clock, Tag } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';

export default function EventSchedule({ onOpenBooking }) {
  const siteConfig = useSiteConfig();
  const events = siteConfig.events || [];

  return (
    <section id="events" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2 sm:mb-3 font-semibold">
            PERFORMANCE CALENDAR
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            {siteConfig.sectionConfig?.find(s => s.id === 'events')?.name || "Upcoming concerts & tour dates."}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Stay tuned for upcoming live concerts, devotional recitals, and tour schedule announcements.
          </p>
        </motion.div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt, idx) => (
              <motion.div
                key={evt.id || idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                className="apple-bento p-6 border border-white/10 flex flex-col justify-between space-y-6 group hover:border-amber-400/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 font-semibold">
                      {evt.formattedDate || evt.date}
                    </span>
                    {evt.category && (
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-400" />
                        {evt.category}
                      </span>
                    )}
                  </div>

                  <h3 className="font-sans text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {evt.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-300">
                    {evt.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{evt.time}</span>
                      </div>
                    )}
                    {(evt.venue || evt.city) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{[evt.venue, evt.city].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenBooking}
                  className="w-full bg-white/10 hover:bg-white text-white hover:text-black font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
                >
                  <span>Book / Enquire</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Coming Soon Bento Box */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="apple-bento p-8 sm:p-16 text-center max-w-4xl mx-auto border border-white/15 relative overflow-hidden flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
              <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-[0.3em] text-amber-400 font-bold block mb-2">
                TOUR & CONCERT DATES
              </span>
              <h3 className="font-sans text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                Coming Soon
              </h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                New concert dates and tour schedules will be announced here soon. For custom event bookings and performance requests, submit an enquiry below.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenBooking}
              className="bg-white hover:bg-gray-200 text-black font-extrabold px-8 py-3.5 rounded-full text-sm transition-all shadow-2xl inline-flex items-center gap-2 mt-4"
            >
              <span>Booking Enquiry</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

      </div>
    </section>
  );
}
