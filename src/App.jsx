import React, { useState } from 'react';
import StudioApp from './studio/StudioApp';
import MainSiteView from './components/MainSiteView';

export default function App() {
  const isElectron = typeof window !== 'undefined' && (
    window.navigator.userAgent.includes('Electron') || 
    window.location.protocol === 'file:'
  );

  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    isElectron
  );

  const [isStudioOpen, setIsStudioOpen] = useState(
    (typeof window !== 'undefined' && window.location.search.includes('mode=studio')) || isElectron
  );

  if (isStudioOpen) {
    return <StudioApp onCloseStudio={() => setIsStudioOpen(false)} />;
  }

  return (
    <div className="relative min-h-screen bg-black">
      <MainSiteView />

      {/* Floating Studio Button for Local Desktop editing */}
      {isLocalHost && (
        <button
          onClick={() => setIsStudioOpen(true)}
          className="fixed bottom-5 right-5 z-50 bg-gradient-to-r from-amber-500 to-amber-400 text-black px-4 py-2.5 rounded-full font-bold text-xs shadow-2xl hover:scale-105 transition-all border border-amber-300 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
          ✏️ Open MS Studio Editor
        </button>
      )}
    </div>
  );
}
