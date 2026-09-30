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
  if (typeof src === 'string' && assetMap[src]) {
    return assetMap[src];
  }
  return src;
}
