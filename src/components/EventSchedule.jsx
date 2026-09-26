import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight } from 'lucide-react';

export default function EventSchedule({ onOpenBooking }) {
  return (
    <section id="events" className="py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-3 font-semibold">
            PERFORMANCE CALENDAR
          </span>
          <h2 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Upcoming concerts & tour dates.
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Stay tuned for upcoming live concerts, devotional recitals, and tour schedule announcements.
          </p>
        </motion.div>

        {/* Coming Soon Bento Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="apple-bento p-12 sm:p-16 text-center max-w-4xl mx-auto border border-white/15 relative overflow-hidden flex flex-col items-center justify-center space-y-6"
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center">
            <Calendar className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase font-mono tracking-[0.3em] text-amber-400 font-bold block mb-2">
              TOUR & CONCERT DATES
            </span>
            <h3 className="font-sans text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
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

      </div>
    </section>
  );
}
