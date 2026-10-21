import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, MapPin, Clock, Tag, Ticket, ExternalLink } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';
import { incrementCounter, sanitizeCounterId } from '../utils/metrics';

export default function EventSchedule({ onOpenBooking }) {
  const siteConfig = useSiteConfig();
  const events = siteConfig.events || [];

  // Sort concerts ascending: earliest date first, later dates after
  const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleBookTicket = async (evt) => {
    // Increment concert-specific counter
    const counterName = `${sanitizeCounterId(evt.title)}_book_ticket_counter`;
    incrementCounter(counterName);
    incrementCounter('total_book_ticket_clicks');

    if (evt.ticketUrl) {
      window.open(evt.ticketUrl, '_blank', 'noopener,noreferrer');
    } else {
      if (onOpenBooking) onOpenBooking();
    }
  };

  const handleEnquire = () => {
    incrementCounter('concert_enquiry_clicks');
    if (onOpenBooking) onOpenBooking();
  };

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
            Stay tuned for upcoming live concerts, devotional recitals, and tour schedule announcements. Sorted by earliest upcoming date.
          </p>
        </motion.div>

        {sortedEvents.length > 0 ? (
          <div className="space-y-4">
            {sortedEvents.map((evt, idx) => {
              const isTicketed = Boolean(evt.ticketed);
              return (
                <motion.div
                  key={evt.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="group relative bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Date Badge & Category */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-20 sm:w-24 py-2.5 px-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center flex flex-col items-center justify-center">
                      <Calendar className="w-4 h-4 text-amber-400 mb-1" />
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-amber-400 tracking-wider">
                        {evt.formattedDate || evt.date}
                      </span>
                    </div>

                    <div className="md:hidden flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-max ${
                        isTicketed
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      }`}>
                        <Ticket className="w-3 h-3" />
                        {isTicketed ? 'Ticketed' : 'Free Entry'}
                      </span>
                      {evt.category && (
                        <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-400/70" />
                          {evt.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: Concert Title, Venue, Time */}
                  <div className="flex-grow min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-sans text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                        {evt.title}
                      </h3>
                      <div className="hidden md:inline-flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isTicketed
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                        }`}>
                          <Ticket className="w-3 h-3" />
                          {isTicketed ? 'Ticketed' : 'Free Entry'}
                        </span>
                        {evt.category && (
                          <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3 text-amber-400/70" />
                            {evt.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-400">
                      {evt.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{evt.time}</span>
                        </div>
                      )}
                      {(evt.venue || evt.city) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>{[evt.venue, evt.city].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 flex items-center justify-end">
                    {isTicketed ? (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleBookTicket(evt)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm py-2.5 px-5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Ticket className="w-4 h-4" />
                        <span>Book Ticket</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleEnquire}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl border border-white/20 transition-all cursor-pointer"
                      >
                        <span>Enquire</span>
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty / Coming Soon Bento Box */
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
