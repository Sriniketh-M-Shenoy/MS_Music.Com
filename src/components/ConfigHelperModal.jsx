import React from 'react';
import { X, FileCode, Check, Settings, Sparkles, FormInput, ExternalLink } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export default function ConfigHelperModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/40 relative max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white p-2 bg-velvet-800/80 rounded-full"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-white">
              Website Configuration Guide
            </h2>
            <p className="text-xs text-amber-400">
              How to easily update site content & Google Form link
            </p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-gray-300">
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
              <FileCode className="w-4 h-4" />
              <span>Central Config Location</span>
            </div>
            <p className="text-xs text-gray-300">
              All text, social media links, audio tracks, YouTube videos, photo gallery, event dates, and Google Form links are stored in:
            </p>
            <code className="block mt-2 bg-black/60 p-2 rounded text-xs font-mono text-amber-400 border border-amber-500/20">
              src/config/siteConfig.js
            </code>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
              <FormInput className="w-4 h-4 text-amber-400" />
              1. Updating Your Google Form Embed
            </h3>
            <p className="text-xs leading-relaxed text-gray-300 mb-2">
              To embed your own Google Form for receiving event enquiries directly on the website:
            </p>
            <ol className="list-decimal list-inside text-xs space-y-1 pl-2 text-gray-400">
              <li>Create or open your Google Form in Google Drive.</li>
              <li>Click <strong>Send</strong> at the top right.</li>
              <li>Select the <strong>&lt;&gt; (Embed HTML)</strong> tab.</li>
              <li>Copy the URL inside the <code className="text-amber-300">src="..."</code> attribute.</li>
              <li>Paste that URL into <code className="text-amber-300">googleForm.embedUrl</code> inside <code className="text-amber-300">siteConfig.js</code>.</li>
            </ol>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              2. Social Media Links Configured
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-velvet-800 rounded border border-amber-500/10">
                <span className="font-bold text-amber-400 block">Instagram</span>
                <span className="truncate block text-gray-400">{siteConfig.socials.instagram}</span>
              </div>
              <div className="p-2 bg-velvet-800 rounded border border-amber-500/10">
                <span className="font-bold text-amber-400 block">Facebook</span>
                <span className="truncate block text-gray-400">{siteConfig.socials.facebook}</span>
              </div>
              <div className="p-2 bg-velvet-800 rounded border border-amber-500/10">
                <span className="font-bold text-amber-400 block">YouTube</span>
                <span className="truncate block text-gray-400">{siteConfig.socials.youtube}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-white mb-2">
              3. Deploying to GitHub Pages
            </h3>
            <p className="text-xs text-gray-300 mb-2">
              This project includes a pre-configured <code className="text-amber-300">npm run deploy</code> script using <code className="text-amber-300">gh-pages</code>!
            </p>
            <div className="bg-black/60 p-3 rounded-xl border border-amber-500/20 text-xs font-mono space-y-1 text-amber-300">
              <p># 1. Initialize git (if not already done)</p>
              <p className="text-gray-400">git init && git add . && git commit -m "Initial commit"</p>
              <p className="mt-2"># 2. Add your GitHub repository remote</p>
              <p className="text-gray-400">git remote add origin https://github.com/username/repository.git</p>
              <p className="mt-2"># 3. Deploy automatically to gh-pages branch!</p>
              <p className="text-gray-400">npm run deploy</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-amber-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2 rounded-full text-xs"
          >
            Got It!
          </button>
        </div>

      </div>
    </div>
  );
}
