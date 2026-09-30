import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, Phone, User, MessageSquare, ExternalLink, FileSpreadsheet, Calendar, Clock } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';

function formatGoogleFormEmbedUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.includes('embedded=true')) return trimmed;
  if (trimmed.includes('/viewform')) {
    return trimmed.replace(/\/viewform(\?.*)?$/, '/viewform?embedded=true');
  }
  return trimmed;
}

export default function EnquirySection() {
  const siteConfig = useSiteConfig();

  const rawEmbedUrl = siteConfig.googleForm?.embedUrl || siteConfig.googleForm?.directFormUrl || '';
  const embedUrl = formatGoogleFormEmbedUrl(rawEmbedUrl);
  const directUrl = siteConfig.googleForm?.directFormUrl || rawEmbedUrl || '';

  const isGoogleFormEnabled = Boolean(
    siteConfig.googleForm?.enabled && (embedUrl || directUrl)
  );

  const isEmailFormEnabled = Boolean(siteConfig.emailForm?.enabled !== false);

  const [activeFormTab, setActiveFormTab] = useState(() => {
    if (isGoogleFormEnabled) return 'google';
    if (isEmailFormEnabled) return 'email';
    return 'none';
  });

  useEffect(() => {
    if (activeFormTab === 'google' && !isGoogleFormEnabled) {
      if (isEmailFormEnabled) setActiveFormTab('email');
      else setActiveFormTab('none');
    } else if (activeFormTab === 'email' && !isEmailFormEnabled) {
      if (isGoogleFormEnabled) setActiveFormTab('google');
      else setActiveFormTab('none');
    } else if (activeFormTab === 'none') {
      if (isGoogleFormEnabled) setActiveFormTab('google');
      else if (isEmailFormEnabled) setActiveFormTab('email');
    }
  }, [isGoogleFormEnabled, isEmailFormEnabled, activeFormTab]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    eventTime: '',
    message: ''
  });

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const subject = encodeURIComponent(`Concert Booking Enquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Hello Muralidhar Shenoy,\n\nI would like to enquire about booking a concert / performance.\n\nName: ${formData.name}\nEmail: ${formData.email}\nPhone Number: ${formData.phone}\nProposed Concert Date: ${formData.eventDate || 'Not specified'}\nProposed Concert Time: ${formData.eventTime || 'Not specified'}\n\nEnquiry Details:\n${formData.message}\n\nBest regards,\n${formData.name}`
    );
    window.location.href = `mailto:${siteConfig.socials.email}?subject=${subject}&body=${body}`;
  };

  const showBothTabs = isGoogleFormEnabled && isEmailFormEnabled;
  const currentTab = showBothTabs ? activeFormTab : (isGoogleFormEnabled ? 'google' : (isEmailFormEnabled ? 'email' : 'none'));

  return (
    <section id="enquire" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Eyebrow & Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-400 block mb-2 sm:mb-3 font-semibold">
            PERFORMANCE BOOKING & ENQUIRY
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            Booking Enquiry & Performance Request
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            {isGoogleFormEnabled && isEmailFormEnabled
              ? "Submit your event details via our official Google Booking Form or email directly for custom concert programming."
              : isGoogleFormEnabled
              ? "Submit your event details via our official Google Booking Form for custom concert programming."
              : isEmailFormEnabled
              ? "Submit your event details directly via email for custom concert programming and performance availability."
              : "Reach out via email or social channels for custom concert programming and availability."}
          </p>
        </motion.div>

        {/* Direct Email Badge Card */}
        {isEmailFormEnabled && (
          <div className="max-w-md mx-auto mb-8 sm:mb-12">
            <motion.a
              whileHover={{ y: -4 }}
              href={`mailto:${siteConfig.socials.email}`}
              className="apple-bento p-5 sm:p-6 border border-white/10 hover:border-white/30 flex items-center justify-center gap-4 transition-colors group text-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400 group-hover:bg-white group-hover:text-black transition-colors flex-shrink-0">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber-400 font-bold block mb-1">Direct Official Email</span>
                <p className="text-xs sm:text-sm text-white font-medium truncate">{siteConfig.socials.email}</p>
              </div>
            </motion.a>
          </div>
        )}

        {/* FORM TOGGLE TABS (Rendered only when BOTH forms are enabled) */}
        {showBothTabs && (
          <div className="max-w-3xl mx-auto flex items-center justify-center gap-2 mb-6 bg-white/[0.04] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveFormTab('google')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'google'
                  ? 'bg-amber-500 text-black shadow-lg font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Booking Form</span>
            </button>

            <button
              onClick={() => setActiveFormTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'email'
                  ? 'bg-amber-500 text-black shadow-lg font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Direct Email Form</span>
            </button>
          </div>
        )}

        {/* GOOGLE FORM VIEW */}
        {currentTab === 'google' && (
          <motion.div
            layout
            className="max-w-4xl mx-auto apple-bento p-4 sm:p-8 border border-white/15 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  Official Google Performance Booking Form
                </h3>
                <p className="text-xs text-gray-400 mt-1">Fill out event requirements directly in our official Google Form.</p>
              </div>

              {directUrl && (
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-amber-500 hover:text-black text-amber-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-amber-400/30"
                >
                  <span>Open Form in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {embedUrl ? (
              <div className="w-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  className="w-full h-[680px] sm:h-[750px] border-0"
                  title="Official Google Booking Form"
                >
                  Loading Google Form...
                </iframe>
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
                <FileSpreadsheet className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-base">Google Form Available</h4>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Click below to open our official Google Form directly:
                </p>
                {directUrl && (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-amber-500 text-black px-6 py-3 rounded-xl font-bold text-xs hover:bg-amber-400 transition-all shadow-lg"
                  >
                    Open Google Form ↗
                  </a>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* DIRECT EMAIL FORM VIEW */}
        {currentTab === 'email' && (
          <motion.div
            layout
            className="max-w-3xl mx-auto apple-bento p-6 sm:p-12 border border-white/15"
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

                  {/* Proposed Concert Date */}
                  <div>
                    <label className="block text-xs uppercase font-mono tracking-wider text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Proposed Concert Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
                    />
                  </div>

                  {/* Proposed Concert Time */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase font-mono tracking-wider text-gray-300 mb-2 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Proposed Concert Time</span>
                    </label>
                    <input
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors [color-scheme:dark]"
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
        )}

        {/* BOTH FORMS DISABLED FALLBACK */}
        {currentTab === 'none' && (
          <div className="max-w-2xl mx-auto apple-bento p-8 sm:p-12 text-center border border-white/10 space-y-4">
            <Mail className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
            <h3 className="text-xl font-bold text-white">Booking Enquiries</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Concert booking form submissions are currently closed. For direct queries, reach out at:
            </p>
            <a href={`mailto:${siteConfig.socials.email}`} className="text-amber-400 font-mono text-sm underline font-bold inline-block pt-1">
              {siteConfig.socials.email}
            </a>
          </div>
        )}

      </div>
    </section>
  );
}

