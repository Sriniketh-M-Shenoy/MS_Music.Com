import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

let ROOT_DIR = path.resolve(__dirname, '..');
let ASAR_PATH = null;

// Handle execution from inside packaged Electron app.asar or moved app bundle
if (ROOT_DIR.includes('app.asar')) {
  const asarIndex = ROOT_DIR.indexOf('.app/Contents/Resources/app.asar');
  if (asarIndex !== -1) {
    ASAR_PATH = ROOT_DIR.substring(0, asarIndex + '.app/Contents/Resources/app.asar'.length);
    const appDir = ROOT_DIR.substring(0, asarIndex + 4);
    const candidates = [
      path.resolve(appDir, '..'),
      path.resolve(appDir, '..', '..'),
      process.cwd(),
      '/Users/muralidharshenoy/Desktop/My_Website/MS_Music.Com'
    ];
    let found = false;
    for (const cand of candidates) {
      if (cand && fs.existsSync(path.join(cand, 'src', 'content')) && fs.existsSync(path.join(cand, 'package.json'))) {
        ROOT_DIR = cand;
        found = true;
        break;
      }
    }
    if (!found) {
      ROOT_DIR = ASAR_PATH;
    }
  } else {
    ROOT_DIR = process.cwd();
  }
}

const PORT = process.env.PORT || 3001;

// Ensure upload directories exist
let UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
if (ROOT_DIR.includes('app.asar')) {
  const userDataDir = process.env.APPDATA || (process.platform === 'darwin' ? path.join(process.env.HOME, 'Library', 'Application Support', 'MS Music Studio') : path.join(process.env.HOME, '.config', 'MS Music Studio'));
  UPLOADS_DIR = path.join(userDataDir, 'uploads');
}

if (!fs.existsSync(UPLOADS_DIR)) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (e) {}
}

// Content directory
const CONTENT_DIR = path.join(ROOT_DIR, 'src', 'content');

const USER_DATA_DIR = process.env.APPDATA || (
  process.platform === 'darwin' 
    ? path.join(process.env.HOME, 'Library', 'Application Support', 'MS Music Studio') 
    : path.join(process.env.HOME, '.config', 'MS Music Studio')
);

try {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }
} catch (e) {}

function getGitConfigPath() {
  if (ROOT_DIR.includes('app.asar') || __dirname.includes('app.asar')) {
    return path.join(USER_DATA_DIR, 'git-config.json');
  }
  return path.join(ROOT_DIR, 'studio', 'git-config.json');
}

function readSavedPat() {
  const pathsToCheck = [
    path.join(USER_DATA_DIR, 'git-config.json'),
    path.join(ROOT_DIR, 'studio', 'git-config.json')
  ];
  for (const p of pathsToCheck) {
    try {
      if (fs.existsSync(p) && !p.includes('app.asar')) {
        const raw = fs.readFileSync(p, 'utf8');
        const cfg = JSON.parse(raw);
        if (cfg && cfg.githubPat) return cfg.githubPat.trim();
      }
    } catch (e) {}
  }
  return '';
}

function savePat(pat) {
  const targetPath = getGitConfigPath();
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, JSON.stringify({ githubPat: pat, updatedAt: new Date().toISOString() }, null, 2));
}

function getGitPushCommand() {
  const gitPat = readSavedPat();

  let remoteUrl = '';
  try {
    remoteUrl = execSync('git config --get remote.origin.url', { cwd: ROOT_DIR }).toString().trim();
  } catch (e) {}

  if (!remoteUrl || !remoteUrl.includes('github.com')) {
    remoteUrl = 'https://github.com/Sriniketh-M-Shenoy/MS_Music.Com.git';
  }

  const cleanRemote = remoteUrl.replace(/^https?:\/\/(?:[^@]+@)?/, '');
  if (gitPat && cleanRemote) {
    return `git push https://${encodeURIComponent(gitPat)}@${cleanRemote} main`;
  }
  return 'git push origin main';
}

// Helper to set CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Helper to read JSON request body
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper to parse multipart/form-data for file uploads
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      return reject(new Error('Invalid content-type: missing boundary'));
    }
    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const chunks = [];

    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const boundaryBuffer = Buffer.from(`--${boundary}`);
      const parts = [];

      let start = 0;
      while (start < buffer.length) {
        const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
        if (boundaryIndex === -1) break;
        
        if (start > 0) {
          const partBuffer = buffer.slice(start, boundaryIndex - 2);
          parts.push(partBuffer);
        }
        start = boundaryIndex + boundaryBuffer.length + 2;
      }

      const files = [];
      const fields = {};

      for (const part of parts) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        const headerText = part.slice(0, headerEnd).toString('utf8');
        const bodyBuffer = part.slice(headerEnd + 4);

        const nameMatch = headerText.match(/name="([^"]+)"/);
        const filenameMatch = headerText.match(/filename="([^"]+)"/);
        const contentTypeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);

        if (filenameMatch) {
          const fieldName = nameMatch ? nameMatch[1] : 'file';
          const originalFilename = filenameMatch[1];
          const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';
          files.push({
            fieldName,
            originalFilename,
            mimeType,
            buffer: bodyBuffer
          });
        } else if (nameMatch) {
          fields[nameMatch[1]] = bodyBuffer.toString('utf8').trim();
        }
      }

      resolve({ fields, files });
    });
    req.on('error', reject);
  });
}

// Generators for JS content files
function generateHeroJs(data) {
  const bgImport = data.heroImage && data.heroImage.startsWith('/uploads/') 
    ? `"${data.heroImage}"` 
    : `heroBg`;
  const sigImport = data.signatureImage && data.signatureImage.startsWith('/uploads/') 
    ? `"${data.signatureImage}"` 
    : `msSignature`;

  let code = ``;
  if (!data.heroImage || !data.heroImage.startsWith('/uploads/')) {
    code += `import heroBg from '../assets/hero/hero_background.png';\n`;
  }
  if (!data.signatureImage || !data.signatureImage.startsWith('/uploads/')) {
    code += `import msSignature from '../assets/branding/ms_signature.png';\n`;
  }
  code += `
export const heroContent = {
  name: ${JSON.stringify(data.name || "Muralidhar Shenoy")},
  title: ${JSON.stringify(data.title || "Playback Singer & Music Composer")},
  tagline: ${JSON.stringify(data.tagline || "Playback Singer & Music Composer")},
  subtitle: ${JSON.stringify(data.subtitle || "Devotional, Light & Classical Vocal Performance")},
  heroImage: ${bgImport},
  signatureImage: ${sigImport},
  bookingButtonText: ${JSON.stringify(data.bookingButtonText || "Booking Enquiry")}
};
`;
  return code.trim();
}

function generateAboutJs(data) {
  const portrait = data.portraitImage && data.portraitImage.startsWith('/uploads/')
    ? `"${data.portraitImage}"`
    : `picRedKurta`;

  let code = ``;
  if (!data.portraitImage || !data.portraitImage.startsWith('/uploads/')) {
    code += `import picRedKurta from '../assets/about/pic_red_kurta.png';\n`;
  }
  code += `
export const aboutContent = {
  hometown: ${JSON.stringify(data.hometown || "Kochi, Kerala")},
  corporateBackground: ${JSON.stringify(data.corporateBackground || "")},
  portraitImage: ${portrait},
  aboutParagraphs: ${JSON.stringify(data.aboutParagraphs || [], null, 2)},
  location: ${JSON.stringify(data.location || "Kochi, Kerala & Mangaluru, Karnataka")},
  availableFor: ${JSON.stringify(data.availableFor || [], null, 2)},
  languages: ${JSON.stringify(data.languages || [], null, 2)},
  stats: ${JSON.stringify(data.stats || [], null, 2)}
};
`;
  return code.trim();
}

function generateSocialsJs(data) {
  const isGoogleFormEnabled = data.googleFormEnabled === true || data.googleFormEnabled === 'true' || data.googleFormEnabled === undefined;
  const isEmailFormEnabled = data.emailFormEnabled !== false && data.emailFormEnabled !== 'false';
  let yt = data.youtube || "https://www.youtube.com/@muralidharshenoykochi";
  if (yt.includes("muralidhargshenoykochi")) yt = "https://www.youtube.com/@muralidharshenoykochi";
  let ytSub = data.youtubeSubscribe || "https://www.youtube.com/@muralidharshenoykochi?sub_confirmation=1";
  if (!ytSub || ytSub.includes("UCZZkLUPMv1Ka4bNSyOpYGOA") || ytSub.includes("muralidhargshenoykochi")) ytSub = "https://www.youtube.com/@muralidharshenoykochi?sub_confirmation=1";

  return `export const socialsContent = {
  spotify: ${JSON.stringify(data.spotify || "")},
  instagram: ${JSON.stringify(data.instagram || "")},
  youtube: ${JSON.stringify(yt)},
  youtubeSubscribe: ${JSON.stringify(ytSub)},
  facebook: ${JSON.stringify(data.facebook || "")},
  email: ${JSON.stringify(data.email || "")},
  youtubeHandle: ${JSON.stringify(data.youtubeHandle || "@muralidharshenoykochi")},
  googleFormEnabled: ${isGoogleFormEnabled},
  googleFormEmbedUrl: ${JSON.stringify(data.googleFormEmbedUrl !== undefined ? data.googleFormEmbedUrl : "")},
  googleFormDirectUrl: ${JSON.stringify(data.googleFormDirectUrl !== undefined ? data.googleFormDirectUrl : "")},
  emailFormEnabled: ${isEmailFormEnabled}
};`;
}

function generateAudioJs(data) {
  const defaultImports = `import picSingingMic from '../assets/gallery/pic_singing_mic.png';
import picRedKurta from '../assets/about/pic_red_kurta.png';
import picMicBlack from '../assets/gallery/pic_mic_black.png';\n\n`;

  const itemsCode = data.map((item, index) => {
    let coverVal = `"${item.coverImage}"`;
    if (item.coverImage === 'picSingingMic') coverVal = `picSingingMic`;
    else if (item.coverImage === 'picRedKurta') coverVal = `picRedKurta`;
    else if (item.coverImage === 'picMicBlack') coverVal = `picMicBlack`;

    return `  {
    id: ${item.id || index + 1},
    title: ${JSON.stringify(item.title || "")},
    genre: ${JSON.stringify(item.genre || "")},
    language: ${JSON.stringify(item.language || "")},
    duration: ${JSON.stringify(item.duration || "")},
    spotifyUrl: ${JSON.stringify(item.spotifyUrl || "")},
    audioUrl: ${JSON.stringify(item.audioUrl || "")},
    coverImage: ${coverVal}
  }`;
  }).join(',\n');

  return `${defaultImports}export const audioTracksContent = [\n${itemsCode}\n];`;
}

function isUpcomingConcert(event) {
  if (!event || !event.date) return false;
  const str = String(event.date).trim();
  const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d.getTime() >= today.getTime();
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0);
    return parsed.getTime() >= today.getTime();
  }
  return true;
}

function generateEventsJs(data, notifData) {
  let eventsList = [];
  let notifs = {
    enabled: true,
    buttonText: "Get Concert Notifications & Tour Updates",
    badgeText: "Concert Alerts",
    title: "Never Miss a Live Concert",
    description: "Sign up to receive email notifications and instant tour updates when Muralidhar Shenoy announces new live concerts, acoustic evenings, and ticket releases in your city.",
    formUrl: "https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/preview",
    directFormUrl: "https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform"
  };

  if (Array.isArray(data)) {
    eventsList = data;
  } else if (data && typeof data === 'object') {
    eventsList = Array.isArray(data.events) ? data.events : (Array.isArray(data.items) ? data.items : []);
    if (data.notifications || data.concertNotifications) {
      notifs = { ...notifs, ...(data.notifications || data.concertNotifications) };
    }
  }

  if (notifData && typeof notifData === 'object') {
    notifs = { ...notifs, ...notifData };
  }

  const upcomingOnly = eventsList.filter(isUpcomingConcert);
  const itemsCode = upcomingOnly.map((item, index) => `  {
    id: ${item.id || index + 1},
    title: ${JSON.stringify(item.title || "")},
    date: ${JSON.stringify(item.date || "")},
    formattedDate: ${JSON.stringify(item.formattedDate || "")},
    time: ${JSON.stringify(item.time || "")},
    venue: ${JSON.stringify(item.venue || "")},
    city: ${JSON.stringify(item.city || "")},
    status: ${JSON.stringify(item.status || "Available")},
    category: ${JSON.stringify(item.category || "Public Concert")},
    ticketed: ${Boolean(item.ticketed)},
    ticketUrl: ${JSON.stringify(item.ticketUrl || "")}
  }`).join(',\n');

  const notifsCode = `export const concertNotificationsConfig = {
  enabled: ${Boolean(notifs.enabled !== false)},
  buttonText: ${JSON.stringify(notifs.buttonText || "Get Concert Notifications & Tour Updates")},
  badgeText: ${JSON.stringify(notifs.badgeText || "Concert Alerts")},
  title: ${JSON.stringify(notifs.title || "Never Miss a Live Concert")},
  description: ${JSON.stringify(notifs.description || "Sign up to receive email notifications and instant tour updates when Muralidhar Shenoy announces new live concerts, acoustic evenings, and ticket releases in your city.")},
  formUrl: ${JSON.stringify(notifs.formUrl || "https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/preview")},
  directFormUrl: ${JSON.stringify(notifs.directFormUrl || (notifs.formUrl ? notifs.formUrl.replace('/preview', '/viewform') : "https://docs.google.com/forms/d/1aPQuJo05sngxlWQL2jdZh_FUOQd6qDHIGW2F3NeB8dI/viewform"))}
};`;

  return `export const eventsContent = [\n${itemsCode}\n];\n\n${notifsCode}\n`;
}

function generateGalleryJs(data) {
  const defaultImports = `import picSingingMic from '../assets/gallery/pic_singing_mic.png';
import picMicBlack from '../assets/gallery/pic_mic_black.png';
import picRedKurta from '../assets/about/pic_red_kurta.png';
import picTshirt from '../assets/gallery/pic_tshirt.png';\n\n`;

  const itemsCode = data.map((item, index) => {
    let urlVal = `"${item.url}"`;
    if (item.url === 'picSingingMic') urlVal = `picSingingMic`;
    else if (item.url === 'picMicBlack') urlVal = `picMicBlack`;
    else if (item.url === 'picRedKurta') urlVal = `picRedKurta`;
    else if (item.url === 'picTshirt') urlVal = `picTshirt`;

    return `  {
    id: ${item.id || index + 1},
    url: ${urlVal},
    caption: ${JSON.stringify(item.caption || "")},
    category: ${JSON.stringify(item.category || "Concerts")}
  }`;
  }).join(',\n');

  return `${defaultImports}export const galleryContent = [\n${itemsCode}\n];`;
}

function generatePostsJs(data) {
  const defaultImports = `import picSingingMic from '../assets/gallery/pic_singing_mic.png';
import picMicBlack from '../assets/gallery/pic_mic_black.png';
import picRedKurta from '../assets/about/pic_red_kurta.png';\n\n`;

  const itemsCode = data.map((item, index) => {
    let thumbVal = `"${item.thumbnail}"`;
    if (item.thumbnail === 'picSingingMic') thumbVal = `picSingingMic`;
    else if (item.thumbnail === 'picMicBlack') thumbVal = `picMicBlack`;
    else if (item.thumbnail === 'picRedKurta') thumbVal = `picRedKurta`;

    return `  {
    id: ${item.id || index + 1},
    platform: ${JSON.stringify(item.platform || "YouTube")},
    title: ${JSON.stringify(item.title || "")},
    type: ${JSON.stringify(item.type || "Latest Video")},
    handle: ${JSON.stringify(item.handle || "")},
    thumbnail: ${thumbVal},
    url: ${JSON.stringify(item.url || "")},
    actionText: ${JSON.stringify(item.actionText || "View Post ↗")},
    description: ${JSON.stringify(item.description || "")}
  }`;
  }).join(',\n');

  return `${defaultImports}export const latestPostsContent = [\n${itemsCode}\n];`;
}

function generateTestimonialsJs(data) {
  const itemsCode = data.map(item => `  {
    quote: ${JSON.stringify(item.quote || "")},
    name: ${JSON.stringify(item.name || "")},
    role: ${JSON.stringify(item.role || "")},
    location: ${JSON.stringify(item.location || "")}
  }`).join(',\n');

  return `export const testimonialsContent = [\n${itemsCode}\n];`;
}

function generateFaqsJs(data) {
  const itemsCode = data.map(item => `  {
    q: ${JSON.stringify(item.q || "")},
    a: ${JSON.stringify(item.a || "")}
  }`).join(',\n');

  return `export const faqsContent = [\n${itemsCode}\n];`;
}

function generateVideosJs(data) {
  const sorted = [...data].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return `// Automatically synced YouTube videos & shorts from @muralidharshenoykochi\nexport const videosContent = ${JSON.stringify(sorted, null, 2)};\n`;
}

function parseRelativeTime(timeAgo) {
  if (!timeAgo) return new Date().toISOString().split('T')[0];
  const now = Date.now();
  const match = timeAgo.match(/(\d+)\s*([a-zA-Z]+)/);
  if (!match) return new Date().toISOString().split('T')[0];
  const num = parseInt(match[1], 10) || 1;
  const unit = match[2].toLowerCase();

  let ms = 0;
  if (unit.startsWith('second') || unit.startsWith('sec') || unit === 's') {
    ms = num * 1000;
  } else if (unit.startsWith('minute') || unit.startsWith('min') || unit === 'm') {
    ms = num * 60 * 1000;
  } else if (unit.startsWith('hour') || unit.startsWith('hr') || unit === 'h') {
    ms = num * 3600 * 1000;
  } else if (unit.startsWith('day') || unit.startsWith('d')) {
    ms = num * 24 * 3600 * 1000;
  } else if (unit.startsWith('week') || unit.startsWith('wk') || unit === 'w') {
    ms = num * 7 * 24 * 3600 * 1000;
  } else if (unit.startsWith('month') || unit.startsWith('mo')) {
    ms = num * 30 * 24 * 3600 * 1000;
  } else if (unit.startsWith('year') || unit.startsWith('yr') || unit === 'y') {
    ms = num * 365 * 24 * 3600 * 1000;
  }
  return new Date(now - ms).toISOString().split('T')[0];
}

async function syncYouTubeChannelVideos() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  const videosPath = path.join(CONTENT_DIR, 'videos.js');
  const existingMap = new Map();
  let customItems = [];

  if (fs.existsSync(videosPath)) {
    try {
      const raw = fs.readFileSync(videosPath, 'utf-8');
      const match = raw.match(/export const videosContent = (\[[\s\S]*?\]);/);
      if (match) {
        const existing = eval(match[1]);
        if (Array.isArray(existing)) {
          for (const item of existing) {
            if (item) {
              if (item.videoId) {
                existingMap.set(item.videoId, item);
              }
              if (item.isCustom) {
                customItems.push(item);
              }
            }
          }
        }
      }
    } catch (e) {}
  }

  const scrapedVideos = [];
  const scrapedShorts = [];

  // 1. Fetch Videos
  try {
    const vRes = await fetch('https://www.youtube.com/@muralidharshenoykochi/videos', { headers });
    if (vRes.ok) {
      const vHtml = await vRes.text();
      const vMatch = vHtml.match(/ytInitialData\s*=\s*({.*?});<\/script>/s) || vHtml.match(/var ytInitialData = ({.*?});<\/script>/s);
      if (vMatch) {
        const vData = JSON.parse(vMatch[1]);
        function extractVideos(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.lockupViewModel) {
            const vm = obj.lockupViewModel;
            const title = vm.metadata?.lockupMetadataViewModel?.title?.content || '';
            const videoId = vm.contentId || vm.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
            const metaRows = vm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
            let views = '';
            let timeAgo = '';
            if (metaRows.length > 0 && metaRows[0].metadataParts) {
              views = metaRows[0].metadataParts[0]?.text?.content || '';
              timeAgo = metaRows[0].metadataParts[1]?.text?.content || '';
            }
            if (videoId && title && !scrapedVideos.find(x => x.videoId === videoId)) {
              scrapedVideos.push({
                videoId,
                title,
                views: views ? (views.toLowerCase().includes('view') ? views : `${views} views`) : '',
                timeAgo: timeAgo || 'Recent'
              });
            }
          }
          for (const k of Object.keys(obj)) extractVideos(obj[k]);
        }
        extractVideos(vData);
      }
    }
  } catch (err) {
    console.error('Error fetching videos:', err.message);
  }

  // 2. Fetch Shorts
  try {
    const sRes = await fetch('https://www.youtube.com/@muralidharshenoykochi/shorts', { headers });
    if (sRes.ok) {
      const sHtml = await sRes.text();
      const sMatch = sHtml.match(/ytInitialData\s*=\s*({.*?});<\/script>/s) || sHtml.match(/var ytInitialData = ({.*?});<\/script>/s);
      if (sMatch) {
        const sData = JSON.parse(sMatch[1]);
        function extractShorts(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.shortsLockupViewModel) {
            const vm = obj.shortsLockupViewModel;
            const entityId = vm.entityId || '';
            const videoId = vm.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId || entityId.replace('shorts-shelf-item-', '');
            let title = vm.overlayMetadata?.primaryText?.content || '';
            if (!title && vm.accessibilityText) {
              title = vm.accessibilityText.split(',')[0] || '';
            }
            let views = vm.overlayMetadata?.secondaryText?.content || '';
            if (!views && vm.accessibilityText && vm.accessibilityText.includes('views')) {
              const parts = vm.accessibilityText.split(',');
              if (parts[1]) views = parts[1].replace(/–\s*play\s*Short/i, '').trim();
            }
            if (videoId && title && !scrapedShorts.find(x => x.videoId === videoId)) {
              scrapedShorts.push({
                videoId,
                title,
                views: views || ''
              });
            }
          }
          for (const k of Object.keys(obj)) extractShorts(obj[k]);
        }
        extractShorts(sData);
      }
    }
  } catch (err) {
    console.error('Error fetching shorts:', err.message);
  }

  const finalItems = [];
  for (const item of customItems) {
    finalItems.push(item);
  }

  for (const v of scrapedVideos) {
    const cached = existingMap.get(v.videoId);
    let date = cached?.date;
    if (!date) {
      date = parseRelativeTime(v.timeAgo);
    }
    finalItems.push({
      id: `yt-${v.videoId}`,
      videoId: v.videoId,
      title: v.title,
      type: 'Video',
      platform: 'YouTube',
      date,
      views: v.views || cached?.views || '',
      timeAgo: v.timeAgo || cached?.timeAgo || 'Recent',
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
      description: 'Official vocal performance by Muralidhar Shenoy on YouTube.'
    });
  }

  const shortsToFetch = [];
  for (let i = 0; i < scrapedShorts.length; i++) {
    const s = scrapedShorts[i];
    const cached = existingMap.get(s.videoId);
    if (!cached || !cached.date) {
      shortsToFetch.push({ ...s, originalIndex: i });
    }
  }

  if (shortsToFetch.length > 0) {
    const BATCH_SIZE = 6;
    for (let i = 0; i < shortsToFetch.length; i += BATCH_SIZE) {
      const batch = shortsToFetch.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (item) => {
        try {
          const res = await fetch(`https://www.youtube.com/shorts/${item.videoId}`, {
            headers,
            signal: AbortSignal.timeout(6000)
          });
          if (res.ok) {
            const html = await res.text();
            const m = html.match(/"datePublished":\s*"([^"]+)"/) || html.match(/"uploadDate":\s*"([^"]+)"/);
            if (m && m[1]) {
              item.resolvedDate = m[1].split('T')[0];
            }
          }
        } catch (e) {}
      }));
    }
  }

  for (let i = 0; i < scrapedShorts.length; i++) {
    const s = scrapedShorts[i];
    const cached = existingMap.get(s.videoId);
    const fetched = shortsToFetch.find(x => x.videoId === s.videoId);
    let date = fetched?.resolvedDate || cached?.date;

    if (!date) {
      const daysAgo = Math.floor(i * 1.5);
      const est = new Date(Date.now() - (daysAgo * 24 * 3600 * 1000));
      date = est.toISOString().split('T')[0];
    }

    finalItems.push({
      id: `yt-short-${s.videoId}`,
      videoId: s.videoId,
      title: s.title,
      type: 'Short',
      platform: 'YouTube',
      date,
      views: s.views || cached?.views || '',
      timeAgo: cached?.timeAgo || 'Recent Short',
      url: `https://www.youtube.com/shorts/${s.videoId}`,
      thumbnail: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
      description: 'YouTube Short performance clip by Muralidhar Shenoy.'
    });
  }

  finalItems.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  fs.writeFileSync(videosPath, `// Automatically synced YouTube videos & shorts from @muralidharshenoykochi\nexport const videosContent = ${JSON.stringify(finalItems, null, 2)};\n`, 'utf-8');

  try {
    const publicFeedPath = path.join(ROOT_DIR, 'public', 'youtube-feed.json');
    fs.writeFileSync(publicFeedPath, JSON.stringify(finalItems, null, 2), 'utf-8');
  } catch (feedErr) {}

  return finalItems;
}

function generateSectionConfigJs(data) {
  return `export const sectionConfig = ${JSON.stringify(data, null, 2)};`;
}

function autoPullLatest() {
  try {
    execSync('git pull origin main', { cwd: ROOT_DIR });
    console.log('[MS Studio API] Auto-pulled latest remote changes.');
  } catch (err) {
    console.warn('[MS Studio API] Auto-pull skipped:', err.message);
  }
}

// Server router
const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  try {
    // 0. GET /api/git-pull
    if (pathname === '/api/git-pull' && req.method === 'GET') {
      try {
        const pullCmd = getGitPushCommand ? getGitPushCommand().replace('git push', 'git pull') : 'git pull origin main';
        try {
          execSync('git pull origin main', { cwd: ROOT_DIR });
        } catch (gitErr) {
          console.warn('[MS Studio API] git pull warning:', gitErr.message);
        }

        // Auto-sync YouTube videos & shorts during global pull
        let ytVideos = [];
        try {
          ytVideos = await syncYouTubeChannelVideos();
        } catch (ytErr) {
          console.warn('[MS Studio API] YouTube sync in git-pull warning:', ytErr.message);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Successfully pulled latest changes and synced YouTube channel',
          count: ytVideos.length,
          videos: ytVideos
        }));
      } catch (pullErr) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: pullErr.message }));
      }
      return;
    }

    // 1. GET /api/git-status
    if (pathname === '/api/git-status' && req.method === 'GET') {
      let branch = 'main';
      let isClean = true;
      let pendingCount = 0;
      let lastCommit = '';
      let remoteUrl = '';
      let hasConflict = false;

      try {
        branch = execSync('git branch --show-current', { cwd: ROOT_DIR }).toString().trim();
        const statusStr = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
        if (statusStr) {
          isClean = false;
          pendingCount = statusStr.split('\n').filter(Boolean).length;
          if (statusStr.includes('UU') || statusStr.includes('AA') || statusStr.includes('UD') || statusStr.includes('DU')) {
            hasConflict = true;
          }
        }
        if (fs.existsSync(path.join(ROOT_DIR, '.git', 'MERGE_HEAD'))) {
          hasConflict = true;
        }
        lastCommit = execSync('git log -1 --pretty=format:"%h - %s (%cr)"', { cwd: ROOT_DIR }).toString().trim();
        remoteUrl = execSync('git config --get remote.origin.url', { cwd: ROOT_DIR }).toString().trim();
      } catch (err) {
        console.error('Git status error:', err.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ branch, isClean, pendingCount, lastCommit, remoteUrl, hasConflict }));
      return;
    }

    // 2. GET /api/git-history (Version History)
    if (pathname === '/api/git-history' && req.method === 'GET') {
      let history = [];
      try {
        const rawLog = execSync('git log -n 25 --pretty=format:"%H|%h|%s|%an|%ad|%ar" --date=short', { cwd: ROOT_DIR }).toString().trim();
        if (rawLog) {
          history = rawLog.split('\n').map(line => {
            const [hash, shortHash, message, author, date, relativeTime] = line.split('|');
            return { hash, shortHash, message, author, date, relativeTime };
          });
        }
      } catch (err) {
        console.error('Git history error:', err.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ history }));
      return;
    }

    // 3. POST /api/revert-version
    if (pathname === '/api/revert-version' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const targetHash = body.commitHash;
      const targetShort = targetHash ? targetHash.substring(0, 7) : '';

      if (!targetHash) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Commit hash is required' }));
        return;
      }

      const steps = [];
      try {
        steps.push(`Fetching target commit content (${targetShort})...`);
        
        // Checkout content files from that commit
        try {
          execSync(`git checkout ${targetHash} -- src/content/`, { cwd: ROOT_DIR });
          steps.push('Restored site content files from selected version.');
        } catch (checkoutErr) {
          steps.push('Checkout failed, attempting git revert...');
          execSync(`git revert ${targetHash} --no-edit`, { cwd: ROOT_DIR });
        }

        // Commit restored state
        steps.push('Creating new publish commit for restored version...');
        execSync(`git add src/content/ public/uploads/`, { cwd: ROOT_DIR });
        
        const commitMsg = `Reverted & Restored website to version (${targetShort}) via MS Music Studio`;
        try {
          execSync(`git commit -m "${commitMsg}"`, { cwd: ROOT_DIR });
        } catch (commitErr) {
          // Commit might be clean
        }

        steps.push('Pushing restored version live to GitHub...');
        const pushCmd = getGitPushCommand();
        execSync(pushCmd, { cwd: ROOT_DIR });

        steps.push('Deploying live website...');
        try {
          execSync('npm run deploy', { cwd: ROOT_DIR });
        } catch (deployErr) {
          console.warn('Deploy warning:', deployErr.message);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          steps,
          message: `Successfully reverted website to commit ${targetShort} and published live!`
        }));
      } catch (err) {
        console.error('Revert error:', err.message);

        // Check if conflict occurred
        let isConflict = false;
        let conflictFiles = [];
        try {
          const statusStr = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString();
          if (statusStr.includes('UU') || statusStr.includes('AA') || statusStr.includes('UD')) {
            isConflict = true;
            conflictFiles = statusStr.split('\n').filter(s => s.startsWith('UU') || s.startsWith('AA') || s.startsWith('UD')).map(s => s.trim());
          }
        } catch (sErr) {}

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          steps,
          hasConflict: isConflict,
          conflictFiles
        }));
      }
      return;
    }

    // 4. GET /api/conflict-status
    if (pathname === '/api/conflict-status' && req.method === 'GET') {
      let inConflict = false;
      let conflictFiles = [];

      try {
        if (fs.existsSync(path.join(ROOT_DIR, '.git', 'MERGE_HEAD'))) {
          inConflict = true;
        }
        const statusStr = execSync('git status --porcelain', { cwd: ROOT_DIR }).toString().trim();
        if (statusStr) {
          const unmerged = statusStr.split('\n').filter(line => 
            line.startsWith('UU') || line.startsWith('AA') || line.startsWith('UD') || line.startsWith('DU') || line.startsWith('DD')
          );
          if (unmerged.length > 0) {
            inConflict = true;
            conflictFiles = unmerged.map(l => l.substring(3).trim());
          }
        }
      } catch (err) {
        console.error('Conflict status check error:', err.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ inConflict, conflictFiles }));
      return;
    }

    // 5. POST /api/resolve-conflict
    if (pathname === '/api/resolve-conflict' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const strategy = body.strategy || 'keep_mine'; // 'keep_mine' | 'use_restored' | 'abort'

      const steps = [];
      try {
        if (strategy === 'keep_mine') {
          steps.push('Resolving conflicts: Keeping current local changes (--ours)...');
          execSync('git checkout --ours .', { cwd: ROOT_DIR });
          execSync('git add .', { cwd: ROOT_DIR });
          execSync('git commit -m "Resolved merge conflict: Kept current version"', { cwd: ROOT_DIR });
          const pushCmd = getGitPushCommand();
          execSync(pushCmd, { cwd: ROOT_DIR });
          steps.push('Conflict resolved and pushed live!');
        } else if (strategy === 'use_restored') {
          steps.push('Resolving conflicts: Using target restored version (--theirs)...');
          execSync('git checkout --theirs .', { cwd: ROOT_DIR });
          execSync('git add .', { cwd: ROOT_DIR });
          execSync('git commit -m "Resolved merge conflict: Used restored version"', { cwd: ROOT_DIR });
          const pushCmd = getGitPushCommand();
          execSync(pushCmd, { cwd: ROOT_DIR });
          steps.push('Conflict resolved and restored version published live!');
        } else if (strategy === 'abort') {
          steps.push('Aborting merge / revert process...');
          try {
            execSync('git merge --abort', { cwd: ROOT_DIR });
          } catch (aErr) {
            execSync('git reset --hard HEAD', { cwd: ROOT_DIR });
          }
          steps.push('Revert aborted cleanly.');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, steps, message: 'Conflict resolved successfully' }));
      } catch (err) {
        console.error('Resolve conflict error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message, steps }));
      }
      return;
    }

    // 6. POST /api/upload
    if (pathname === '/api/upload' && req.method === 'POST') {
      const GITHUB_MAX_FILE_BYTES = 95 * 1024 * 1024; // 95 MB limit to stay under GitHub's 100 MB hard limit
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > GITHUB_MAX_FILE_BYTES) {
        const sizeMb = (contentLength / (1024 * 1024)).toFixed(1);
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: `Upload size (${sizeMb} MB) exceeds GitHub's 100 MB limit (max allowed: 95 MB). Upload rejected to prevent git push failure.`
        }));
        return;
      }

      const { fields, files } = await parseMultipartForm(req);
      if (!files || files.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No file uploaded' }));
        return;
      }

      const uploadedFile = files[0];
      if (uploadedFile.buffer && uploadedFile.buffer.length > GITHUB_MAX_FILE_BYTES) {
        const sizeMb = (uploadedFile.buffer.length / (1024 * 1024)).toFixed(1);
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: `File "${uploadedFile.originalFilename || 'upload'}" is ${sizeMb} MB, exceeding GitHub's 100 MB limit (max allowed: 95 MB). Upload rejected to prevent git push failure.`
        }));
        return;
      }

      let ext = path.extname(uploadedFile.originalFilename) || '.bin';
      const cleanName = path.basename(uploadedFile.originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      let filename = `${cleanName}_${Date.now()}${ext}`;
      let savePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(savePath, uploadedFile.buffer);

      const distUploadsDir = path.join(ROOT_DIR, 'dist', 'uploads');
      try {
        if (!fs.existsSync(distUploadsDir)) {
          fs.mkdirSync(distUploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(distUploadsDir, filename), uploadedFile.buffer);
      } catch (dErr) {}

      // Auto-convert .aif / .aiff to universal web-compatible .m4a format for HTML5 audio
      if (ext.toLowerCase() === '.aif' || ext.toLowerCase() === '.aiff') {
        try {
          const m4aFilename = `${cleanName}_${Date.now()}.m4a`;
          const m4aSavePath = path.join(UPLOADS_DIR, m4aFilename);
          execSync(`afconvert -f m4af -d aac "${savePath}" "${m4aSavePath}"`, { cwd: ROOT_DIR });
          if (fs.existsSync(m4aSavePath)) {
            try {
              fs.copyFileSync(m4aSavePath, path.join(distUploadsDir, m4aFilename));
            } catch (cErr) {}
            filename = m4aFilename;
          }
        } catch (convErr) {
          console.warn('Audio conversion warning:', convErr.message);
        }
      }

      const publicUrl = `/uploads/${filename}`;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        url: publicUrl,
        filename: filename,
        mimeType: uploadedFile.mimeType
      }));
      return;
    }

    // 6.5 POST /api/sync-youtube
    if (pathname === '/api/sync-youtube' && req.method === 'POST') {
      try {
        const syncedItems = await syncYouTubeChannelVideos();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: syncedItems.length, videos: syncedItems }));
      } catch (syncErr) {
        console.error('YouTube sync error:', syncErr.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: syncErr.message }));
      }
      return;
    }

    // 7. POST /api/save-content
    if (pathname === '/api/save-content' && req.method === 'POST') {
      const body = await readJsonBody(req);
      
      if (body.hero) fs.writeFileSync(path.join(CONTENT_DIR, 'hero.js'), generateHeroJs(body.hero));
      if (body.about) fs.writeFileSync(path.join(CONTENT_DIR, 'about.js'), generateAboutJs(body.about));
      if (body.socials) fs.writeFileSync(path.join(CONTENT_DIR, 'socials.js'), generateSocialsJs(body.socials));
      if (body.audio) fs.writeFileSync(path.join(CONTENT_DIR, 'audio.js'), generateAudioJs(body.audio));
      if (body.events || body.concertNotifications) fs.writeFileSync(path.join(CONTENT_DIR, 'events.js'), generateEventsJs(body.events, body.concertNotifications));
      if (body.gallery) fs.writeFileSync(path.join(CONTENT_DIR, 'gallery.js'), generateGalleryJs(body.gallery));
      if (body.posts) fs.writeFileSync(path.join(CONTENT_DIR, 'posts.js'), generatePostsJs(body.posts));
      if (body.videos) fs.writeFileSync(path.join(CONTENT_DIR, 'videos.js'), generateVideosJs(body.videos));
      if (body.testimonials) fs.writeFileSync(path.join(CONTENT_DIR, 'testimonials.js'), generateTestimonialsJs(body.testimonials));
      if (body.faqs) fs.writeFileSync(path.join(CONTENT_DIR, 'faqs.js'), generateFaqsJs(body.faqs));
      if (body.sectionConfig) fs.writeFileSync(path.join(CONTENT_DIR, 'sectionConfig.js'), generateSectionConfigJs(body.sectionConfig));

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Content saved successfully' }));
      return;
    }

    // 8. POST /api/publish
    if (pathname === '/api/publish' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const commitMsg = body.commitMessage || `Site content updated via MS Music Studio (${new Date().toLocaleString()})`;

      const steps = [];
      try {
        steps.push('Staging changes...');
        execSync('git add -A', { cwd: ROOT_DIR });

        // Pre-commit safety check: unstage any file over 95MB so git push will never fail
        try {
          const staged = execSync('git diff --cached --name-only', { cwd: ROOT_DIR, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
          for (const sFile of staged) {
            const absP = path.join(ROOT_DIR, sFile);
            if (fs.existsSync(absP)) {
              const fStat = fs.statSync(absP);
              if (fStat.size > 95 * 1024 * 1024) {
                execSync(`git reset HEAD "${sFile}"`, { cwd: ROOT_DIR });
                steps.push(`Notice: Unstaged "${sFile}" (${(fStat.size / (1024 * 1024)).toFixed(1)} MB) because it exceeds GitHub's 100 MB limit.`);
              }
            }
          }
        } catch (checkErr) {}

        steps.push('Creating commit...');
        try {
          execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: ROOT_DIR });
          steps.push('Commit created successfully.');
        } catch (commitErr) {
          // If working tree is clean or changes already committed, continue to push
          console.log('Git commit note:', commitErr.message);
          steps.push('Working tree is clean (changes already committed); proceeding to push.');
        }

        steps.push('Pushing to GitHub...');
        const pushCmd = getGitPushCommand();
        execSync(pushCmd, { cwd: ROOT_DIR, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
        try {
          execSync('git fetch origin main', { cwd: ROOT_DIR, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
        } catch (fErr) {}

        steps.push('Deploying live website...');
        try {
          execSync('npm run deploy', { cwd: ROOT_DIR, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }, timeout: 15000 });
          steps.push('Deploy completed successfully!');
        } catch (deployErr) {
          steps.push('Changes pushed to GitHub. Live GitHub Pages deploy workflow is updating automatically in the background.');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, steps, message: 'Published live to website successfully!' }));
      } catch (err) {
        console.error('Publishing error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: err.message,
          steps
        }));
      }
      return;
    }

    // Static uploaded files serving
    if (pathname.startsWith('/uploads/')) {
      let filePath = path.join(ROOT_DIR, 'public', pathname);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(ROOT_DIR, 'dist', pathname);
      }
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.mp3': 'audio/mpeg',
          '.wav': 'audio/wav',
          '.m4a': 'audio/m4a',
          '.ogg': 'audio/ogg'
        };
        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // Static site build files serving from dist/
    const distDir = path.join(ROOT_DIR, 'dist');
    let relPath = pathname;
    if (relPath.startsWith('/MS_Music.Com/')) {
      relPath = relPath.replace('/MS_Music.Com/', '/');
    }
    let staticFilePath = path.join(distDir, relPath === '/' ? 'index.html' : relPath);

    if (!fs.existsSync(staticFilePath) || fs.statSync(staticFilePath).isDirectory()) {
      staticFilePath = path.join(distDir, 'index.html');
    }

    if (fs.existsSync(staticFilePath)) {
      const ext = path.extname(staticFilePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html; charset=UTF-8',
        '.js': 'text/javascript; charset=UTF-8',
        '.css': 'text/css; charset=UTF-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2'
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(staticFilePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[MS Studio API] Server already active on http://localhost:${PORT}`);
  } else {
    console.error('[MS Studio API] Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`[MS Studio API] Server running on http://localhost:${PORT}`);
  autoPullLatest();
  // Automatically clean past concerts on server launch
  try {
    const cleanScript = path.join(ROOT_DIR, 'scripts', 'clean-past-concerts.js');
    exec(`node "${cleanScript}"`, (err, stdout) => {
      if (!err && stdout) console.log('[MS Studio API]', stdout.trim());
    });
  } catch (e) {}
  // Automatically sync latest YouTube videos & shorts on server launch in the background
  syncYouTubeChannelVideos()
    .then(items => console.log(`[MS Studio API] Background YouTube sync complete (${items.length} items).`))
    .catch(err => console.warn('[MS Studio API] Background YouTube sync notice:', err.message));
});

