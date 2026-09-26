import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, Phone, User, MessageSquare } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function EnquirySection() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const subject = encodeURIComponent(`Concert Booking Enquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Hello Muralidhar Shenoy,\n\nI would like to enquire about booking a concert / performance.\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone Number: ${formData.phone}\n\nEnquiry Details:\n${formData.message}\n\nBest regards,\n${formData.name}`
    );
    window.location.href = `mailto:${siteConfig.socials.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="enquire" className="py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Eyebrow & Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-16"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-3 font-semibold">
            PERFORMANCE BOOKING & ENQUIRY
          </span>
          <h2 className="font-sans text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Booking Enquiry & Performance Request
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Fill out the form below to enquire about concert availability, musical programs, or performance bookings.
          </p>
        </motion.div>

        {/* Direct Email Card */}
        <div className="max-w-md mx-auto mb-12">
          <motion.a
            whileHover={{ y: -4 }}
            href={`mailto:${siteConfig.socials.email}`}
            className="apple-bento p-6 border border-white/10 hover:border-white/30 flex items-center justify-center gap-4 transition-colors group text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-white group-hover:text-black transition-colors flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-400 font-bold block mb-1">Direct Official Email</span>
              <p className="text-sm text-white font-medium">{siteConfig.socials.email}</p>
            </div>
          </motion.a>
        </div>

        {/* Form Container */}
        <motion.div
          layout
          className="max-w-3xl mx-auto apple-bento p-8 sm:p-12 border border-white/15"
        >
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-sans text-3xl font-bold text-white">
                Enquiry Email Prepared
              </h3>
              <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">
                Thank you! Your booking enquiry has been formatted and opened in your email client to send directly to Muralidhar Shenoy.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-amber-400 underline pt-4 block mx-auto font-medium"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleDirectSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-mono tracking-wider text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Your Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@example.com"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Enquiry Details Text Box */}
                <div className="sm:col-span-2">
                  <label className="block text-xs uppercase font-mono tracking-wider text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Enquire About The Concert / Details *</span>
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the event, proposed dates, location, music preferences, or any specific questions..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors resize-y"
                  />
                </div>

              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-white hover:bg-gray-200 text-black font-extrabold py-4 rounded-xl transition-all shadow-2xl flex items-center justify-center gap-2 text-base mt-4"
              >
                <Send className="w-5 h-5 text-black" />
                <span>Submit Booking Enquiry</span>
              </motion.button>
            </form>
          )}
        </motion.div>

      </div>
    </section>
  );
}
