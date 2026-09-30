import picSingingMic from '../assets/gallery/pic_singing_mic.png';
import picRedKurta from '../assets/about/pic_red_kurta.png';
import picMicBlack from '../assets/gallery/pic_mic_black.png';
import picTshirt from '../assets/gallery/pic_tshirt.png';
import heroBg from '../assets/hero/hero_background.png';
import msSignature from '../assets/branding/ms_signature.png';

const assetMap = {
  picSingingMic,
  picRedKurta,
  picMicBlack,
  picTshirt,
  heroBg,
  msSignature
};

export function resolveImageSrc(src) {
  if (!src) return picSingingMic;

  if (typeof src === 'string') {
    const trimmed = src.trim();
    if (assetMap[trimmed]) return assetMap[trimmed];

    // Check embedded asset filenames from historic file paths
    if (trimmed.includes('pic_singing_mic')) return picSingingMic;
    if (trimmed.includes('pic_mic_black')) return picMicBlack;
    if (trimmed.includes('pic_red_kurta')) return picRedKurta;
    if (trimmed.includes('pic_tshirt')) return picTshirt;
    if (trimmed.includes('hero_background')) return heroBg;
    if (trimmed.includes('ms_signature')) return msSignature;

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
  }

  return src;
}
