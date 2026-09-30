import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Globe, Upload, Save, CheckCircle2, AlertCircle, RefreshCw, 
  Plus, Trash2, Edit3, Eye, ArrowUp, ArrowDown, ArrowLeft, ChevronLeft, Music, Calendar, 
  Image as ImageIcon, FileText, MessageSquare, HelpCircle, Share2, Sliders,
  X, Play, Pause, ExternalLink, Check, ChevronRight, History, RotateCcw,
  GitBranch, GitCommit, GitMerge, AlertTriangle, ShieldAlert
} from 'lucide-react';

import { 
  heroContent as initialHero,
  aboutContent as initialAbout,
  socialsContent as initialSocials,
  latestPostsContent as initialPosts,
  audioTracksContent as initialAudio,
  eventsContent as initialEvents,
  galleryContent as initialGallery,
  testimonialsContent as initialTestimonials,
  faqsContent as initialFaqs,
  sectionConfig as initialSectionConfig
} from '../content';

import MainSiteView from '../components/MainSiteView';

const API_BASE = 'http://localhost:3001';

export default function StudioApp({ onCloseStudio }) {
  // Mode: 'editor' | 'preview'
  const [viewMode, setViewMode] = useState('editor');
  const [activeTab, setActiveTab] = useState('hero');

  // Helper to load draft from localStorage or fallback
  const getInitialDraft = (key, fallback) => {
    try {
      const saved = localStorage.getItem('ms_studio_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[key] !== undefined && parsed[key] !== null) {
          return parsed[key];
        }
      }
    } catch (e) {}
    return fallback;
  };

  // State data
  const [hero, setHero] = useState(() => getInitialDraft('hero', initialHero));
  const [about, setAbout] = useState(() => getInitialDraft('about', initialAbout));
  const [socials, setSocials] = useState(() => getInitialDraft('socials', initialSocials));
  const [posts, setPosts] = useState(() => getInitialDraft('posts', initialPosts));
  const [audio, setAudio] = useState(() => getInitialDraft('audio', initialAudio));
  const [events, setEvents] = useState(() => getInitialDraft('events', initialEvents));
  const [gallery, setGallery] = useState(() => getInitialDraft('gallery', initialGallery));
  const [testimonials, setTestimonials] = useState(() => getInitialDraft('testimonials', initialTestimonials));
  const [faqs, setFaqs] = useState(() => getInitialDraft('faqs', initialFaqs));
  const [sectionConfig, setSectionConfig] = useState(() => getInitialDraft('sectionConfig', initialSectionConfig || [
    { id: 'hero', name: 'Hero Banner', enabled: true },
    { id: 'about', name: 'About Artist', enabled: true },
    { id: 'posts', name: 'Latest Posts', enabled: true },
    { id: 'music', name: 'Music Showcase', enabled: true },
    { id: 'events', name: 'Concert Schedule', enabled: true },
    { id: 'socials', name: 'Social Channels', enabled: true },
    { id: 'gallery', name: 'Photo Gallery', enabled: true },
    { id: 'testimonials', name: 'Testimonials', enabled: true },
    { id: 'enquiry', name: 'Booking Enquiry', enabled: true }
  ]));

  // Auto-sync draft to localStorage on state changes
  useEffect(() => {
    try {
      localStorage.setItem('ms_studio_draft', JSON.stringify({
        hero, about, socials, posts, audio, events, gallery, testimonials, faqs, sectionConfig
      }));
    } catch (e) {}
  }, [hero, about, socials, posts, audio, events, gallery, testimonials, faqs, sectionConfig]);

  // UI status
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving' | 'saved' | 'error'
  const [gitStatus, setGitStatus] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  
  // Modals
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictFiles, setConflictFiles] = useState([]);

  // Progress status
  const [commitMessage, setCommitMessage] = useState('');
  const [publishProgress, setPublishProgress] = useState(null);
  const [revertProgress, setRevertProgress] = useState(null);
  const [syncStatus, setSyncStatus] = useState(''); // 'syncing' | 'synced' | ''

  // Section Manager state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [addSectionType, setAddSectionType] = useState('standard');
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomDesc, setNewCustomDesc] = useState('');
  const [newCustomContent, setNewCustomContent] = useState('');

  const ALL_BUILTIN_SECTIONS = [
    { id: 'hero', name: 'Hero Banner & Tagline' },
    { id: 'about', name: 'About Artist & Biography' },
    { id: 'posts', name: 'Latest Posts & Social Feeds' },
    { id: 'music', name: 'Music & Audio Track Showcase' },
    { id: 'events', name: 'Concerts & Event Schedule' },
    { id: 'socials', name: 'YouTube & Social Channels' },
    { id: 'gallery', name: 'Photo & Performance Gallery' },
    { id: 'testimonials', name: 'Client & Fan Testimonials' },
    { id: 'enquiry', name: 'Booking Enquiry & Google Form' }
  ];

  // Fetch status, version history & auto-pull latest from git remote on mount
  useEffect(() => {
    handleSyncGitPull();
    fetchGitStatus();
    fetchGitHistory();
    checkConflictStatus();
  }, []);

  const handleSyncGitPull = async () => {
    try {
      setSyncStatus('syncing');
      const res = await fetch(`${API_BASE}/api/git-pull`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSyncStatus('synced');
          fetchGitStatus();
          fetchGitHistory();
          setTimeout(() => setSyncStatus(''), 4000);
        } else {
          setSyncStatus('');
        }
      } else {
        setSyncStatus('');
      }
    } catch (err) {
      console.warn('Auto-pull fetch failed:', err.message);
      setSyncStatus('');
    }
  };

  const fetchGitStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/git-status`);
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data);
        if (data.hasConflict) {
          checkConflictStatus();
        }
      }
    } catch (err) {
      console.warn('Backend server not reachable on port 3001. Running local mode.', err);
    }
  };

  const fetchGitHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/git-history`);
      if (res.ok) {
        const data = await res.json();
        setVersionHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Could not fetch git history.', err);
    }
  };

  const checkConflictStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/conflict-status`);
      if (res.ok) {
        const data = await res.json();
        if (data.inConflict) {
          setConflictFiles(data.conflictFiles || []);
          setIsConflictModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('Could not check conflict status.', err);
    }
  };

  const markDirty = () => {
    setIsDirty(true);
  };

  // Upload handler helper
  const handleFileUpload = async (file, onSuccess) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      setSaveStatus('uploading');
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        markDirty();
        setSaveStatus('uploaded');
        setTimeout(() => setSaveStatus(''), 2000);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
        setSaveStatus('');
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Could not upload file to backend server. Make sure studio backend is running on port 3001.');
      setSaveStatus('');
    }
  };

  // Save changes to backend disk files & browser session
  const handleSaveChanges = async () => {
    setSaveStatus('saving');
    // Save to browser localStorage draft immediately
    try {
      localStorage.setItem('ms_studio_draft', JSON.stringify({
        hero, about, socials, posts, audio, events, gallery, testimonials, faqs, sectionConfig
      }));
    } catch (e) {}

    try {
      const res = await fetch(`${API_BASE}/api/save-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero, about, socials, posts, audio, events, gallery, testimonials, faqs, sectionConfig
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsDirty(false);
        setSaveStatus('saved');
        fetchGitStatus();
        fetchGitHistory();
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setIsDirty(false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      console.warn('Save draft (session state updated):', err);
      setIsDirty(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Publish live to Git & GitHub Pages
  const handlePublishLive = async () => {
    await handleSaveChanges();

    const defaultMsg = commitMessage || `Updated website content via MS Music Studio - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    setPublishProgress({
      step: 'Initiating git publish process...',
      steps: ['Saving changes to project files...', 'Staging modifications...', 'Generating git commit...', 'Pushing to GitHub remote...', 'Deploying live site...'],
      done: false
    });

    try {
      const res = await fetch(`${API_BASE}/api/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitMessage: defaultMsg })
      });

      const data = await res.json();
      if (data.success) {
        setPublishProgress({
          step: 'Successfully published to live website!',
          steps: data.steps || ['Saved files', 'Git commit created', 'Pushed to GitHub', 'Deployed live'],
          done: true
        });
        fetchGitStatus();
        fetchGitHistory();
      } else {
        setPublishProgress({
          step: 'Publish encountered an error',
          steps: data.steps || [],
          done: false,
          error: data.error || 'Check internet connection and git configuration.'
        });
      }
    } catch (err) {
      setPublishProgress({
        step: 'Network or Server Error during publishing',
        steps: [],
        done: false,
        error: err.message || 'Server disconnected'
      });
    }
  };

  // Revert to a specific past version / commit
  const handleRevertVersion = async (commit) => {
    if (!commit) return;

    setRevertProgress({
      step: `Restoring website state to commit ${commit.shortHash}...`,
      steps: ['Reading historic snapshot...', 'Checking out saved content files...', 'Creating revert commit...', 'Pushing restored state live...'],
      done: false
    });

    try {
      const res = await fetch(`${API_BASE}/api/revert-version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitHash: commit.hash })
      });

      const data = await res.json();
      if (data.success) {
        setRevertProgress({
          step: `Successfully reverted website to version ${commit.shortHash}!`,
          steps: data.steps || ['Checked out files', 'Created restore commit', 'Pushed to GitHub', 'Site updated live!'],
          done: true
        });
        fetchGitStatus();
        fetchGitHistory();
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      } else if (data.hasConflict) {
        setRevertProgress(null);
        setIsRevertModalOpen(false);
        setConflictFiles(data.conflictFiles || []);
        setIsConflictModalOpen(true);
      } else {
        setRevertProgress({
          step: 'Revert encountered an error',
          steps: data.steps || [],
          done: false,
          error: data.error || 'Could not complete revert.'
        });
      }
    } catch (err) {
      setRevertProgress({
        step: 'Revert failed due to network error',
        steps: [],
        done: false,
        error: err.message
      });
    }
  };

  // Resolve Merge Conflict
  const handleResolveConflict = async (strategy) => {
    try {
      const res = await fetch(`${API_BASE}/api/resolve-conflict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy })
      });

      const data = await res.json();
      if (data.success) {
        setIsConflictModalOpen(false);
        fetchGitStatus();
        fetchGitHistory();
        alert('Merge conflict resolved successfully!');
        window.location.reload();
      } else {
        alert('Conflict resolution failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to send conflict resolution command: ' + err.message);
    }
  };

  // Reorder sections
  const moveSection = (index, direction) => {
    const newConfig = [...sectionConfig];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newConfig.length) return;
    const temp = newConfig[index];
    newConfig[index] = newConfig[targetIndex];
    newConfig[targetIndex] = temp;
    setSectionConfig(newConfig);
    markDirty();
  };

  const toggleSection = (index) => {
    const newConfig = [...sectionConfig];
    newConfig[index].enabled = !newConfig[index].enabled;
    setSectionConfig(newConfig);
    markDirty();
  };

  const updateSectionName = (index, name) => {
    const newConfig = [...sectionConfig];
    newConfig[index].name = name;
    setSectionConfig(newConfig);
    markDirty();
  };

  const updateCustomSectionField = (index, field, value) => {
    const newConfig = [...sectionConfig];
    newConfig[index][field] = value;
    setSectionConfig(newConfig);
    markDirty();
  };

  const deleteSection = (index) => {
    const newConfig = sectionConfig.filter((_, i) => i !== index);
    setSectionConfig(newConfig);
    markDirty();
  };

  const handleAddStandardSection = (standardSec) => {
    if (!standardSec) return;
    const newConfig = [...sectionConfig, { id: standardSec.id, name: standardSec.name, enabled: true }];
    setSectionConfig(newConfig);
    markDirty();
    setIsAddSectionOpen(false);
  };

  const handleAddCustomSection = () => {
    if (!newCustomName || !newCustomName.trim()) {
      alert('Please enter a section name.');
      return;
    }
    const customId = `custom_${Date.now()}`;
    const newConfig = [...sectionConfig, {
      id: customId,
      name: newCustomName.trim(),
      description: newCustomDesc.trim(),
      content: newCustomContent.trim(),
      enabled: true
    }];
    setSectionConfig(newConfig);
    markDirty();
    setNewCustomName('');
    setNewCustomDesc('');
    setNewCustomContent('');
    setIsAddSectionOpen(false);
  };

  // FULL SITE PREVIEW MODE: Pure website preview with a sleek center-left floating arrow tab
  if (viewMode === 'preview') {
    return (
      <div className="relative min-h-screen bg-black overflow-y-auto">
        <button
          onClick={() => setViewMode('editor')}
          title="Back to Edit Mode"
          className="fixed top-1/2 -translate-y-1/2 left-0 z-50 group flex items-center bg-zinc-900/95 hover:bg-amber-500 text-amber-400 hover:text-black py-4 px-3 rounded-r-2xl shadow-2xl border-t border-r border-b border-amber-500/40 hover:border-amber-400 transition-all duration-300 transform active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6 stroke-[3] group-hover:-translate-x-1 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-extrabold pr-1">
            Back to Edit Mode
          </span>
        </button>
        <MainSiteView 
          customSectionConfig={sectionConfig} 
          customContent={{ hero, about, socials, posts, audio, events, gallery, testimonials, faqs }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black antialiased">
      
      {/* TOP HEADER BAR (Shown only in Edit Mode) */}
      <header className="sticky top-0 z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <img
            src={resolveImageSrc(hero.signatureImage || initialHero.signatureImage)}
            alt="Muralidhar Shenoy Signature"
            className="h-9 lg:h-10 w-auto object-contain filter brightness-125"
          />
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              MS Music Studio
            </h1>
            <p className="text-[11px] text-zinc-400">Easy Website Manager for Muralidhar Shenoy</p>
          </div>
        </div>

        {/* CENTER VIEW TOGGLE */}
        <div className="flex items-center bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 shadow-inner">
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'editor' 
                ? 'bg-amber-500 text-black shadow-md font-bold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Mode
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'preview' 
                ? 'bg-amber-500 text-black shadow-md font-bold' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Full Site Preview
          </button>
        </div>

        {/* RIGHT ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {syncStatus === 'syncing' && (
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Syncing Git Remote...
            </span>
          )}

          {syncStatus === 'synced' && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Synced Remote
            </span>
          )}

          {isDirty && (
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Unsaved Edits
            </span>
          )}

          {saveStatus === 'saved' && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved Local Draft
            </span>
          )}

          {/* Sync Remote Button */}
          <button
            onClick={handleSyncGitPull}
            disabled={syncStatus === 'syncing'}
            title="Pull latest website changes from GitHub"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Latest</span>
          </button>

          {/* Quick Save Button */}
          <button
            onClick={handleSaveChanges}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
          </button>

          {/* Publish Live Button */}
          <button
            onClick={() => {
              setCommitMessage('');
              setPublishProgress(null);
              setIsPublishModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:from-amber-400 hover:to-amber-300 shadow-lg shadow-amber-500/20 border border-amber-300/40 transition-all transform active:scale-95"
          >
            <Globe className="w-4 h-4" />
            Publish to Website
          </button>

          {onCloseStudio && (
            <button
              onClick={onCloseStudio}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* EDIT MODE VIEWPORT */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden max-h-[calc(100vh-65px)]">

          {/* LEFT SIDEBAR CATEGORY NAVIGATION */}
          <aside className="w-full md:w-64 bg-zinc-900/60 border-r border-zinc-800/80 p-3 flex flex-col gap-1 overflow-y-auto shrink-0">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-2">
              Website Content Sections
            </div>

            {[
              { id: 'hero', label: 'Hero & Tagline', icon: Sparkles },
              { id: 'about', label: 'About & Biography', icon: FileText },
              { id: 'audio', label: 'Music & Audio Tracks', icon: Music },
              { id: 'events', label: 'Concerts & Events', icon: Calendar },
              { id: 'gallery', label: 'Photo Gallery', icon: ImageIcon },
              { id: 'posts', label: 'Latest Posts & Social', icon: Share2 },
              { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
              { id: 'faqs', label: 'FAQs & Questions', icon: HelpCircle },
              { id: 'socials', label: 'Social Links & Booking', icon: Globe },
              { id: 'order', label: 'Reorder & Hide Sections', icon: Sliders },
              { id: 'history', label: 'Version History & Revert', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span className="flex-grow text-left">{tab.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}

            {/* Quick Info Box */}
            <div className="mt-auto pt-4 border-t border-zinc-800/60 text-xs text-zinc-400 p-3 bg-zinc-950/40 rounded-xl">
              <div className="font-semibold text-zinc-300 flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                Live Git Remote
              </div>
              <p className="text-[11px] truncate text-zinc-500">{gitStatus?.remoteUrl || 'GitHub Connected'}</p>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Branch: {gitStatus?.branch || 'main'}
              </p>
            </div>
          </aside>

          {/* RIGHT EDITOR PANEL */}
          <main className="flex-grow bg-zinc-950 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* 1. HERO TAB */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      Hero & Tagline Settings
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Manage the top main banner content displayed when visitors load your site.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Artist Main Name</label>
                      <input
                        type="text"
                        value={hero.name || ''}
                        onChange={e => { setHero({ ...hero, name: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Title / Profession</label>
                      <input
                        type="text"
                        value={hero.title || ''}
                        onChange={e => { setHero({ ...hero, title: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={hero.tagline || ''}
                        onChange={e => { setHero({ ...hero, tagline: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Subtitle / Genres Summary</label>
                      <input
                        type="text"
                        value={hero.subtitle || ''}
                        onChange={e => { setHero({ ...hero, subtitle: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Booking Button Label</label>
                      <input
                        type="text"
                        value={hero.bookingButtonText || ''}
                        onChange={e => { setHero({ ...hero, bookingButtonText: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Image uploads for Hero */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-2">Hero Background Picture</label>
                      <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-xl p-4 text-center transition-all bg-zinc-900/40">
                        {hero.heroImage && (
                          <img src={hero.heroImage} alt="Hero Preview" className="w-full h-36 object-cover rounded-lg mb-3 border border-zinc-700" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e.target.files[0], url => setHero({ ...hero, heroImage: url }))}
                          className="hidden"
                          id="hero-img-file"
                        />
                        <label htmlFor="hero-img-file" className="cursor-pointer text-xs font-bold text-amber-400 hover:underline flex items-center justify-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Upload New Hero Background
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-2">Artist Signature Branding Image</label>
                      <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-xl p-4 text-center transition-all bg-zinc-900/40">
                        {hero.signatureImage && (
                          <img src={hero.signatureImage} alt="Signature Preview" className="h-20 object-contain mx-auto mb-3 p-2 bg-zinc-950 rounded-lg border border-zinc-800" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e.target.files[0], url => setHero({ ...hero, signatureImage: url }))}
                          className="hidden"
                          id="signature-img-file"
                        />
                        <label htmlFor="signature-img-file" className="cursor-pointer text-xs font-bold text-amber-400 hover:underline flex items-center justify-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Upload New Signature PNG
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ABOUT TAB */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      About & Biography Settings
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Hometown & Origin</label>
                      <input
                        type="text"
                        value={about.hometown || ''}
                        onChange={e => { setAbout({ ...about, hometown: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Current Base / Locations</label>
                      <input
                        type="text"
                        value={about.location || ''}
                        onChange={e => { setAbout({ ...about, location: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Corporate Career Highlights</label>
                      <input
                        type="text"
                        value={about.corporateBackground || ''}
                        onChange={e => { setAbout({ ...about, corporateBackground: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Biography Paragraphs */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">Biography Paragraphs</label>
                    {(about.aboutParagraphs || []).map((para, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-3">
                        <textarea
                          rows={3}
                          value={para}
                          onChange={e => {
                            const newParas = [...about.aboutParagraphs];
                            newParas[idx] = e.target.value;
                            setAbout({ ...about, aboutParagraphs: newParas });
                            markDirty();
                          }}
                          className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white outline-none"
                        />
                        <button
                          onClick={() => {
                            const newParas = about.aboutParagraphs.filter((_, i) => i !== idx);
                            setAbout({ ...about, aboutParagraphs: newParas });
                            markDirty();
                          }}
                          className="p-2 text-zinc-500 hover:text-red-400 bg-zinc-900 rounded-lg border border-zinc-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setAbout({ ...about, aboutParagraphs: [...(about.aboutParagraphs || []), ""] });
                        markDirty();
                      }}
                      className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1 mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Paragraph
                    </button>
                  </div>

                  {/* Portrait Upload */}
                  <div className="pt-4 border-t border-zinc-800">
                    <label className="block text-xs font-semibold text-zinc-300 mb-2">Artist Portrait Photo</label>
                    <div className="flex items-center gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
                      {about.portraitImage && (
                        <img src={about.portraitImage} alt="Portrait" className="w-24 h-24 object-cover rounded-xl border border-zinc-700" />
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e.target.files[0], url => setAbout({ ...about, portraitImage: url }))}
                          className="hidden"
                          id="portrait-img-file"
                        />
                        <label htmlFor="portrait-img-file" className="cursor-pointer inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all">
                          <Upload className="w-4 h-4" />
                          Change Portrait Photo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. AUDIO TRACKS TAB */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-amber-400" />
                        Music & Audio Tracks Showcase
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setAudio([...audio, {
                          id: Date.now(),
                          title: "New Musical Composition",
                          genre: "Devotional / Classical",
                          language: "Hindi",
                          duration: "03:30",
                          spotifyUrl: "",
                          audioUrl: "",
                          coverImage: "picSingingMic"
                        }]);
                        markDirty();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Song Track
                    </button>
                  </div>

                  <div className="space-y-4">
                    {audio.map((track, index) => (
                      <div key={track.id || index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                          <input
                            type="text"
                            value={track.title || ''}
                            onChange={e => {
                              const newA = [...audio];
                              newA[index].title = e.target.value;
                              setAudio(newA);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white font-bold w-64 outline-none"
                          />
                          <button
                            onClick={() => {
                              setAudio(audio.filter((_, i) => i !== index));
                              markDirty();
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Genre"
                            value={track.genre || ''}
                            onChange={e => {
                              const newA = [...audio];
                              newA[index].genre = e.target.value;
                              setAudio(newA);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Language"
                            value={track.language || ''}
                            onChange={e => {
                              const newA = [...audio];
                              newA[index].language = e.target.value;
                              setAudio(newA);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Duration (03:45)"
                            value={track.duration || ''}
                            onChange={e => {
                              const newA = [...audio];
                              newA[index].duration = e.target.value;
                              setAudio(newA);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Spotify / Streaming URL"
                            value={track.spotifyUrl || ''}
                            onChange={e => {
                              const newA = [...audio];
                              newA[index].spotifyUrl = e.target.value;
                              setAudio(newA);
                              markDirty();
                            }}
                            className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                          />
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={e => handleFileUpload(e.target.files[0], url => {
                              const newA = [...audio];
                              newA[index].audioUrl = url;
                              setAudio(newA);
                            })}
                            className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500/10 file:text-amber-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. EVENTS TAB */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-amber-400" />
                      Concerts & Event Schedule
                    </h2>
                    <button
                      onClick={() => {
                        setEvents([...events, {
                          id: Date.now(),
                          title: "New Live Concert Evening",
                          date: new Date().toISOString().split('T')[0],
                          formattedDate: "NOV 20, 2026",
                          time: "6:30 PM IST",
                          venue: "Auditorium Hall",
                          city: "Bengaluru",
                          status: "Available",
                          category: "Public Concert"
                        }]);
                        markDirty();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Event
                    </button>
                  </div>

                  <div className="space-y-4">
                    {events.map((evt, index) => (
                      <div key={evt.id || index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <input
                            type="text"
                            value={evt.title || ''}
                            onChange={e => {
                              const newE = [...events];
                              newE[index].title = e.target.value;
                              setEvents(newE);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1 text-sm font-bold text-white w-72 outline-none"
                          />
                          <button
                            onClick={() => {
                              setEvents(events.filter((_, i) => i !== index));
                              markDirty();
                            }}
                            className="p-1 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <input
                            type="text"
                            placeholder="Formatted Date (OCT 15, 2026)"
                            value={evt.formattedDate || ''}
                            onChange={e => {
                              const newE = [...events];
                              newE[index].formattedDate = e.target.value;
                              setEvents(newE);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Time"
                            value={evt.time || ''}
                            onChange={e => {
                              const newE = [...events];
                              newE[index].time = e.target.value;
                              setEvents(newE);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Venue"
                            value={evt.venue || ''}
                            onChange={e => {
                              const newE = [...events];
                              newE[index].venue = e.target.value;
                              setEvents(newE);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            value={evt.city || ''}
                            onChange={e => {
                              const newE = [...events];
                              newE[index].city = e.target.value;
                              setEvents(newE);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. GALLERY TAB */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-amber-400" />
                      Photo Gallery Manager
                    </h2>
                    <button
                      onClick={() => {
                        setGallery([...gallery, { id: Date.now(), url: "picSingingMic", caption: "Performance Photo", category: "Concerts" }]);
                        markDirty();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gallery.map((item, index) => (
                      <div key={item.id || index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-amber-400">Photo #{index + 1}</span>
                          <button onClick={() => { setGallery(gallery.filter((_, i) => i !== index)); markDirty(); }} className="text-zinc-500 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Caption"
                          value={item.caption || ''}
                          onChange={e => {
                            const newG = [...gallery];
                            newG[index].caption = e.target.value;
                            setGallery(newG);
                            markDirty();
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e.target.files[0], url => {
                            const newG = [...gallery];
                            newG[index].url = url;
                            setGallery(newG);
                          })}
                          className="text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500/10 file:text-amber-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. POSTS TAB */}
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-amber-400" />
                      Latest Social Media Posts
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <div key={post.id || index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Title"
                            value={post.title || ''}
                            onChange={e => {
                              const newP = [...posts];
                              newP[index].title = e.target.value;
                              setPosts(newP);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold outline-none"
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            value={post.url || ''}
                            onChange={e => {
                              const newP = [...posts];
                              newP[index].url = e.target.value;
                              setPosts(newP);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Description"
                            value={post.description || ''}
                            onChange={e => {
                              const newP = [...posts];
                              newP[index].description = e.target.value;
                              setPosts(newP);
                              markDirty();
                            }}
                            className="md:col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. TESTIMONIALS TAB */}
              {activeTab === 'testimonials' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-amber-400" />
                      Testimonials & Reviews
                    </h2>
                    <button
                      onClick={() => {
                        setTestimonials([...testimonials, { quote: "New quote...", name: "Name", role: "Role", location: "City" }]);
                        markDirty();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Testimonial
                    </button>
                  </div>

                  <div className="space-y-4">
                    {testimonials.map((item, index) => (
                      <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                          <span className="text-xs font-bold text-amber-400">Testimonial #{index + 1}</span>
                          <button
                            onClick={() => {
                              const newT = testimonials.filter((_, i) => i !== index);
                              setTestimonials(newT);
                              markDirty();
                            }}
                            className="text-zinc-500 hover:text-red-400 p-1"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={item.quote || ''}
                          onChange={e => {
                            const newT = [...testimonials];
                            newT[index].quote = e.target.value;
                            setTestimonials(newT);
                            markDirty();
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Name"
                            value={item.name || ''}
                            onChange={e => {
                              const newT = [...testimonials];
                              newT[index].name = e.target.value;
                              setTestimonials(newT);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Role"
                            value={item.role || ''}
                            onChange={e => {
                              const newT = [...testimonials];
                              newT[index].role = e.target.value;
                              setTestimonials(newT);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Location"
                            value={item.location || ''}
                            onChange={e => {
                              const newT = [...testimonials];
                              newT[index].location = e.target.value;
                              setTestimonials(newT);
                              markDirty();
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. FAQS TAB */}
              {activeTab === 'faqs' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-400" />
                      Frequently Asked Questions
                    </h2>
                    <button
                      onClick={() => {
                        setFaqs([...faqs, { q: "New Question?", a: "Answer text..." }]);
                        markDirty();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add FAQ
                    </button>
                  </div>

                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
                        <input
                          type="text"
                          value={faq.q || ''}
                          onChange={e => {
                            const newF = [...faqs];
                            newF[index].q = e.target.value;
                            setFaqs(newF);
                            markDirty();
                          }}
                          placeholder="Question"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-bold text-white outline-none"
                        />
                        <textarea
                          rows={2}
                          value={faq.a || ''}
                          onChange={e => {
                            const newF = [...faqs];
                            newF[index].a = e.target.value;
                            setFaqs(newF);
                            markDirty();
                          }}
                          placeholder="Answer"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. SOCIALS & FORM TAB */}
              {activeTab === 'socials' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Globe className="w-5 h-5 text-amber-400" />
                      Social Media & Booking Links
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Spotify Artist URL</label>
                      <input
                        type="text"
                        value={socials.spotify || ''}
                        onChange={e => { setSocials({ ...socials, spotify: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">YouTube Channel URL</label>
                      <input
                        type="text"
                        value={socials.youtube || ''}
                        onChange={e => { setSocials({ ...socials, youtube: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Instagram Profile URL</label>
                      <input
                        type="text"
                        value={socials.instagram || ''}
                        onChange={e => { setSocials({ ...socials, instagram: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Facebook Profile URL</label>
                      <input
                        type="text"
                        value={socials.facebook || ''}
                        onChange={e => { setSocials({ ...socials, facebook: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">Booking Email Address</label>
                      <input
                        type="email"
                        value={socials.email || ''}
                        onChange={e => { setSocials({ ...socials, email: e.target.value }); markDirty(); }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* GOOGLE FORM & EMAIL FORM CONFIGURATION BLOCK */}
                  <div className="pt-6 border-t border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <div>
                        <span className="font-bold text-xs text-white block">Enable Google Booking Form</span>
                        <span className="text-[11px] text-zinc-400">Embed official Google Form in the website booking section</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const isCurrentlyEnabled = socials.googleFormEnabled !== false;
                          setSocials({ ...socials, googleFormEnabled: !isCurrentlyEnabled });
                          markDirty();
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative p-0.5 cursor-pointer ${
                          socials.googleFormEnabled !== false ? 'bg-amber-500' : 'bg-zinc-800'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-black transition-all ${
                          socials.googleFormEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                      <div>
                        <span className="font-bold text-xs text-white block">Enable Direct Email Booking Form</span>
                        <span className="text-[11px] text-zinc-400">Allow visitors to submit direct email booking enquiries</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const isCurrentlyEnabled = socials.emailFormEnabled !== false;
                          setSocials({ ...socials, emailFormEnabled: !isCurrentlyEnabled });
                          markDirty();
                        }}
                        className={`w-12 h-6 rounded-full transition-all relative p-0.5 cursor-pointer ${
                          socials.emailFormEnabled !== false ? 'bg-amber-500' : 'bg-zinc-800'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-black transition-all ${
                          socials.emailFormEnabled !== false ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Google Form Embed URL (iframe src)
                        </label>
                        <input
                          type="text"
                          placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
                          value={socials.googleFormEmbedUrl || ''}
                          onChange={e => { setSocials({ ...socials, googleFormEmbedUrl: e.target.value }); markDirty(); }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">Paste the embed URL from Google Forms Send &gt; Embed (&lt;iframe src="..."&gt;)</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Google Form Direct Share Link
                        </label>
                        <input
                          type="text"
                          placeholder="https://forms.gle/... or https://forms.google.com/..."
                          value={socials.googleFormDirectUrl || ''}
                          onChange={e => { setSocials({ ...socials, googleFormDirectUrl: e.target.value }); markDirty(); }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">Direct share link for opening form in new browser tab</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. REORDER & MANAGE SECTIONS TAB */}
              {activeTab === 'order' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-amber-400" />
                        Section Names, Reorder & Visibility
                      </h2>
                      <p className="text-xs text-zinc-400 mt-1">
                        Edit section names, reorder layout, hide sections, or add/remove sections completely.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAddSectionOpen(!isAddSectionOpen)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                  </div>

                  {/* Add Section Panel */}
                  {isAddSectionOpen && (
                    <div className="bg-zinc-900 border border-amber-500/40 rounded-xl p-4 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">Add New Section to Website</span>
                        <button onClick={() => setIsAddSectionOpen(false)} className="text-zinc-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddSectionType('standard')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            addSectionType === 'standard' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          Re-add Standard Section
                        </button>
                        <button
                          onClick={() => setAddSectionType('custom')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            addSectionType === 'custom' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          Create Custom Section
                        </button>
                      </div>

                      {addSectionType === 'standard' ? (
                        <div className="space-y-2">
                          <span className="text-xs text-zinc-300 block">Select a standard built-in section to re-add:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {ALL_BUILTIN_SECTIONS.filter(sec => !sectionConfig.some(s => s.id === sec.id)).length === 0 ? (
                              <p className="text-xs text-zinc-500 col-span-2 py-2">All standard sections are already present on your page.</p>
                            ) : (
                              ALL_BUILTIN_SECTIONS.filter(sec => !sectionConfig.some(s => s.id === sec.id)).map(sec => (
                                <button
                                  key={sec.id}
                                  onClick={() => handleAddStandardSection(sec)}
                                  className="flex items-center justify-between p-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs text-white font-semibold transition-all text-left"
                                >
                                  <span>{sec.name}</span>
                                  <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1">Section Title / Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Special Honors & Awards"
                              value={newCustomName}
                              onChange={e => setNewCustomName(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1">Short Description / Subtitle (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. Highlights and recognitions over the years"
                              value={newCustomDesc}
                              onChange={e => setNewCustomDesc(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-300 mb-1">Section Body Content</label>
                            <textarea
                              rows={4}
                              placeholder="Type section details, biography highlights, awards list, or custom content..."
                              value={newCustomContent}
                              onChange={e => setNewCustomContent(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-white outline-none focus:border-amber-500"
                            />
                          </div>

                          <button
                            onClick={handleAddCustomSection}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            Create & Add Custom Section
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section List */}
                  <div className="space-y-3">
                    {sectionConfig.map((sec, idx) => (
                      <div key={sec.id} className="bg-zinc-900 border border-zinc-800/80 p-3.5 rounded-xl space-y-3 shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          
                          {/* Left: Enable toggle & Editable Name */}
                          <div className="flex items-center gap-3 flex-grow max-w-xl">
                            <button
                              type="button"
                              onClick={() => toggleSection(idx)}
                              title={sec.enabled ? "Click to hide section" : "Click to show section"}
                              className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                                sec.enabled 
                                  ? 'bg-amber-500 border-amber-400 text-black font-extrabold text-xs shadow-sm' 
                                  : 'bg-zinc-800 border-zinc-700 text-transparent'
                              }`}
                            >
                              ✓
                            </button>

                            <span className="text-xs font-mono font-bold text-zinc-500 shrink-0">#{idx + 1}</span>

                            <input
                              type="text"
                              value={sec.name || ''}
                              onChange={e => updateSectionName(idx, e.target.value)}
                              placeholder="Section Name"
                              className={`flex-grow bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-amber-500 transition-colors ${
                                sec.enabled ? 'text-white' : 'text-zinc-500 line-through'
                              }`}
                            />
                          </div>

                          {/* Right: Controls (Up, Down, Delete) */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => moveSection(idx, -1)}
                              disabled={idx === 0}
                              title="Move Up"
                              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg disabled:opacity-30 transition-all"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => moveSection(idx, 1)}
                              disabled={idx === sectionConfig.length - 1}
                              title="Move Down"
                              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg disabled:opacity-30 transition-all"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove section "${sec.name}" completely?`)) {
                                  deleteSection(idx);
                                }
                              }}
                              title="Remove Section Completely"
                              className="p-1.5 text-zinc-500 hover:text-red-400 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all ml-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Custom Section Details Editor */}
                        {sec.id.startsWith('custom_') && (
                          <div className="pt-3 border-t border-zinc-800/60 space-y-2 bg-zinc-950/60 p-3 rounded-lg">
                            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                              <span>Custom Section Content Editor</span>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Subtitle / Description</label>
                              <input
                                type="text"
                                value={sec.description || ''}
                                onChange={e => updateCustomSectionField(idx, 'description', e.target.value)}
                                placeholder="Subtitle or category description"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Main Body Text</label>
                              <textarea
                                rows={3}
                                value={sec.content || ''}
                                onChange={e => updateCustomSectionField(idx, 'content', e.target.value)}
                                placeholder="Paragraphs or content details..."
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 11. VERSION HISTORY & REVERT TAB */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-400" />
                      Version History & Revert Restores
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">Browse previously published site updates and restore any older version with 1 click.</p>
                  </div>

                  <div className="space-y-3">
                    {versionHistory.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-xs bg-zinc-900/40 rounded-xl border border-zinc-800">
                        No previous versions found or git log empty.
                      </div>
                    ) : (
                      versionHistory.map((item, idx) => (
                        <div key={item.hash || idx} className="flex flex-wrap items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl gap-3 hover:border-zinc-700 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-amber-500/20">
                              <GitCommit className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-amber-400">{item.shortHash}</span>
                                {idx === 0 && (
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                    Current Live Version
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white font-semibold mt-0.5">{item.message}</p>
                              <p className="text-[11px] text-zinc-400 mt-1">
                                Published {item.relativeTime} ({item.date}) by <span className="text-zinc-300">{item.author}</span>
                              </p>
                            </div>
                          </div>

                          {idx !== 0 && (
                            <button
                              onClick={() => {
                                setSelectedCommit(item);
                                setRevertProgress(null);
                                setIsRevertModalOpen(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Revert to this Version
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>

      {/* PUBLISH MODAL */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">Publish Website Live to Git</h3>
              </div>
              {!publishProgress && (
                <button onClick={() => setIsPublishModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {!publishProgress ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-300">
                  Publishing will save your content changes, commit them to your Git repository, and update the live website on GitHub Pages.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Update Log Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Added new song track and updated concert date"
                    value={commitMessage}
                    onChange={e => setCommitMessage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePublishLive}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 shadow-md flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" />
                    🚀 Push Live Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                {publishProgress.done ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl animate-bounce">
                      ✓
                    </div>
                    <h4 className="font-extrabold text-lg text-white">Published Successfully!</h4>
                    <a
                      href="https://sriniketh-m-shenoy.github.io/MS_Music.Com/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-400 transition-all shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Live Website
                    </a>
                  </div>
                ) : publishProgress.error ? (
                  <div className="space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">Publishing Error</h4>
                    <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">{publishProgress.error}</p>
                    <button onClick={() => setPublishProgress(null)} className="px-4 py-2 bg-zinc-800 text-xs font-bold text-white rounded-lg">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <h4 className="font-bold text-white text-sm">{publishProgress.step}</h4>
                  </div>
                )}

                {publishProgress.done && (
                  <div className="pt-2 border-t border-zinc-800">
                    <button onClick={() => setIsPublishModalOpen(false)} className="px-4 py-1.5 text-xs text-zinc-400 hover:text-white">
                      Close Window
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REVERT CONFIRMATION MODAL */}
      {isRevertModalOpen && selectedCommit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-white">Revert Website Version</h3>
              </div>
              {!revertProgress && (
                <button onClick={() => setIsRevertModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {!revertProgress ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-300">
                  Are you sure you want to revert your website back to version <strong className="text-amber-400 font-mono">{selectedCommit.shortHash}</strong>?
                </p>

                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs space-y-1">
                  <div className="font-bold text-white">{selectedCommit.message}</div>
                  <div className="text-zinc-400 text-[11px]">Published: {selectedCommit.relativeTime} ({selectedCommit.date})</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsRevertModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 bg-zinc-800 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRevertVersion(selectedCommit)}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 shadow-md flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore & Publish Live
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                {revertProgress.done ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h4 className="font-extrabold text-lg text-white">Reverted & Published Live!</h4>
                    <p className="text-xs text-zinc-400">Reloading studio editor to reflect restored content...</p>
                  </div>
                ) : revertProgress.error ? (
                  <div className="space-y-3">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                    <h4 className="font-bold text-white text-sm">Revert Error</h4>
                    <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg">{revertProgress.error}</p>
                    <button onClick={() => setRevertProgress(null)} className="px-4 py-2 bg-zinc-800 text-xs font-bold text-white rounded-lg">
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <h4 className="font-bold text-white text-sm">{revertProgress.step}</h4>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VERSION SELECTION & RESOLUTION POPUP */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Which version do you want to keep?</h3>
                  <p className="text-xs text-zinc-400">Choose which version to publish live on your website:</p>
                </div>
              </div>
              <button onClick={() => setIsConflictModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Keep My Studio Edits */}
              <button
                onClick={() => handleResolveConflict('keep_mine')}
                className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-zinc-950 hover:from-amber-500/20 border-2 border-amber-500/40 hover:border-amber-400 text-left transition-all group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500 text-black">
                      ✨ Keep My New Edits
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors">
                    Publish My Current Changes
                  </h4>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Keep all the text, pictures, audio tracks, and updates you just made in MS Studio.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>Publish My Version</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: Keep Live Web Version */}
              <button
                onClick={() => handleResolveConflict('use_restored')}
                className="flex flex-col justify-between p-5 rounded-2xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-600 text-left transition-all group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300">
                      🌐 Keep Live Version
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                    Keep Live Website Version
                  </h4>
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    Keep the version currently published live on your website and discard local draft edits.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                  <span>Keep Live Version</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            <div className="text-center pt-2 border-t border-zinc-800/80">
              <button
                onClick={() => handleResolveConflict('abort')}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                Cancel and return to editor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

