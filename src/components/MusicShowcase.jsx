import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ExternalLink, Music2, Volume2, VolumeX, X, RotateCcw } from 'lucide-react';
import { useSiteConfig } from '../config/siteConfig';
import { resolveImageSrc } from '../utils/resolveImageSrc';

function resolveAudioSrc(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads/')) {
    if (typeof window !== 'undefined') {
      const isDev = window.location.port === '5173' || window.location.port === '3000' || window.location.port === '4173';
      const isElectron = window.location.protocol === 'file:' || window.location.hostname === '';
      if (isDev || isElectron) {
        return `http://localhost:3001${trimmed}`;
      }
      const base = import.meta.env.BASE_URL || './';
      const cleanBase = base.endsWith('/') ? base : `${base}/`;
      return `${cleanBase}${trimmed.replace(/^\//, '')}`;
    }
  }
  return trimmed;
}

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function MusicShowcase() {
  const siteConfig = useSiteConfig();
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Audio Player State
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const audioRef = useRef(null);

  const filteredTracks = selectedLanguage === 'All'
    ? siteConfig.audioTracks
    : siteConfig.audioTracks.filter(t => t.language.toLowerCase() === selectedLanguage.toLowerCase());

  const filterLanguages = ['All', 'Kannada', 'Hindi', 'Konkani', 'Malayalam', 'Tamil'];

  const sectionTitle = siteConfig.sectionConfig?.find(s => s.id === 'music')?.name || "Listen to studio tracks & live performances.";

  const handleTrackClick = (e, track) => {
    e.preventDefault();

    const audioSrc = resolveAudioSrc(track.audioUrl);
    if (audioSrc) {
      // Direct local audio file uploaded! Play inline on site.
      if (activeTrack?.id === track.id) {
        if (isPlaying) {
          audioRef.current?.pause();
          setIsPlaying(false);
        } else {
          audioRef.current?.play().catch(err => console.warn('Audio play error:', err));
          setIsPlaying(true);
        }
      } else {
        setActiveTrack(track);
        setIsPlaying(true);
        setCurrentTime(0);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.src = audioSrc;
            audioRef.current.play().catch(err => console.warn('Audio play error:', err));
          }
        }, 50);
      }
    } else if (track.spotifyUrl) {
      window.open(track.spotifyUrl, '_blank');
    } else if (siteConfig.socials.spotify) {
      window.open(siteConfig.socials.spotify, '_blank');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.warn('Audio play error:', err));
      setIsPlaying(true);
    }
  };

  const handleSeekChange = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
  };

  const handleSeekCommit = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
    setIsSeeking(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section id="showcase" className="py-16 sm:py-24 lg:py-32 relative bg-black border-t border-white/10">
      
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (!isSeeking && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime || 0);
          }
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-10 sm:mb-16"
        >
          <span className="text-xs uppercase font-mono tracking-widestApple text-amber-400 block mb-2 sm:mb-3 font-semibold">
            AUDIO SHOWCASE & REPERTOIRE
          </span>
          <h2 className="font-sans text-3xl sm:text-6xl font-bold tracking-tight text-white mb-4">
            {sectionTitle}
          </h2>
        </motion.div>

        {/* Embedded Official Spotify Artist Player */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="apple-bento p-5 sm:p-8 rounded-3xl mb-12 sm:mb-16 border border-white/15 overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center text-black flex-shrink-0">
                <Music2 className="w-5 h-5 fill-black" />
              </div>
              <div>
                <h3 className="font-sans text-lg sm:text-xl font-bold text-white tracking-tight">
                  Official Spotify Artist Player
                </h3>
                <p className="text-xs text-gray-400">
                  Stream high quality audio directly from Spotify
                </p>
              </div>
            </div>

            <a
              href={siteConfig.socials.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold px-6 py-2.5 rounded-full text-xs transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Listen on Spotify Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10">
            <iframe
              style={{ borderRadius: '16px' }}
              src="https://open.spotify.com/embed/artist/0oEpNPAtIRZ1ReC28uqhdT?utm_source=generator&theme=0"
              width="100%"
              height="352"
              frameBorder="0"
              allowFullScreen=""
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Muralidhar Shenoy Spotify Player"
            />
          </div>
        </motion.div>

        {/* Audio Track Selector Grid */}
        <div className="mb-16 sm:mb-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
                Featured Audio Repertoire
              </h3>
              <p className="text-xs text-gray-400">
                Play uploaded songs directly on site or stream on Spotify
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
              {filterLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`text-xs px-4 py-1.5 rounded-full transition-all flex-shrink-0 ${
                    selectedLanguage === lang
                      ? 'bg-white text-black font-bold'
                      : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTracks.map((track) => {
              const isCurrentPlaying = activeTrack?.id === track.id && isPlaying;
              const hasAudioFile = Boolean(track.audioUrl);

              return (
                <motion.div
                  key={track.id}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleTrackClick(e, track)}
                  className={`apple-bento p-5 border flex items-center justify-between transition-all cursor-pointer group ${
                    isCurrentPlaying ? 'border-amber-500/80 bg-amber-500/10' : 'border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden relative flex-shrink-0 border border-white/10">
                      <img src={resolveImageSrc(track.coverImage)} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-amber-400" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-sans text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {track.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {track.genre} • <span className="text-amber-400/90 font-medium">{track.language}</span>
                      </p>
                      {hasAudioFile && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          Direct Audio File 🎵
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isCurrentPlaying 
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' 
                      : 'bg-white/10 text-white group-hover:bg-amber-500 group-hover:text-black'
                  }`}>
                    {isCurrentPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FLOATING DIRECT AUDIO PLAYER BAR */}
      <AnimatePresence>
        {activeTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 left-4 right-4 md:left-12 md:right-12 z-50 bg-zinc-900/95 border border-amber-500/40 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            {/* Left: Track Info */}
            <div className="flex items-center gap-3.5 w-full sm:w-auto overflow-hidden">
              <img
                src={resolveImageSrc(activeTrack.coverImage)}
                alt={activeTrack.title}
                className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  Now Playing Direct Track
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">{activeTrack.title}</h4>
                <p className="text-[11px] text-zinc-400 truncate">{activeTrack.genre} ({activeTrack.language})</p>
              </div>
            </div>

            {/* Center: Controls & Scrubber */}
            <div className="flex flex-col items-center gap-1.5 w-full sm:max-w-md shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold shadow-lg transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Progress Slider */}
              <div className="flex items-center gap-2 w-full text-[10px] font-mono text-zinc-400">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onMouseDown={() => setIsSeeking(true)}
                  onTouchStart={() => setIsSeeking(true)}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekCommit}
                  onTouchEnd={handleSeekCommit}
                  className="w-full h-1.5 bg-zinc-700 accent-amber-500 rounded-lg cursor-pointer transition-all"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Actions (Mute, Close) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleMute}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  setIsPlaying(false);
                  setActiveTrack(null);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
