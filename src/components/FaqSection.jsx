import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 relative bg-black border-t border-white/10">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        
        {/* Apple Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-mono tracking-widestApple text-amber-400 block mb-3 font-semibold">
            SUPPORT & FAQ
          </span>
          <h2 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {siteConfig.faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="apple-bento border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 font-sans text-lg font-bold text-white hover:text-amber-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-gray-400 leading-relaxed border-t border-white/10 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
