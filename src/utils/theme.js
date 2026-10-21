import { useState, useEffect } from 'react';
import msSignature from '../assets/branding/ms_signature.png';
import msSignatureWhite from '../assets/branding/ms_signature_white.jpg';

export { msSignature, msSignatureWhite };

export function initTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const t = localStorage.getItem('ms_theme') || 'dark';
    if (t === 'light') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.body.classList.remove('light-mode');
    }
    return t;
  } catch (e) {
    return 'dark';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      return localStorage.getItem('ms_theme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    initTheme();

    const handleThemeChange = () => {
      try {
        const current = localStorage.getItem('ms_theme') || 'dark';
        setTheme(current);
        if (current === 'light') {
          document.documentElement.classList.add('light-mode');
          document.body.classList.add('light-mode');
        } else {
          document.documentElement.classList.remove('light-mode');
          document.body.classList.remove('light-mode');
        }
      } catch (e) {}
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('ms_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('ms_theme_changed', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('ms_theme', next);
      if (next === 'light') {
        document.documentElement.classList.add('light-mode');
        document.body.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
        document.body.classList.remove('light-mode');
      }
      window.dispatchEvent(new Event('ms_theme_changed'));
    } catch (e) {}
    setTheme(next);
  };

  return {
    theme,
    toggleTheme,
    signatureSrc: theme === 'light' ? msSignatureWhite : msSignature
  };
}
