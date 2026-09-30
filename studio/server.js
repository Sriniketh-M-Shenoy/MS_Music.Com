import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let ROOT_DIR = path.resolve(__dirname, '..');

// Handle execution from inside packaged Electron app.asar
if (ROOT_DIR.includes('app.asar')) {
  const asarIndex = ROOT_DIR.indexOf('.app/Contents/Resources/app.asar');
  if (asarIndex !== -1) {
    const appBundlePath = ROOT_DIR.substring(0, asarIndex + 4);
    ROOT_DIR = path.resolve(appBundlePath, '..');
  } else {
    ROOT_DIR = process.cwd();
  }
}

const PORT = process.env.PORT || 3001;

// Ensure upload directories exist
const UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Content directory
const CONTENT_DIR = path.join(ROOT_DIR, 'src', 'content');

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

  return `export const socialsContent = {
  spotify: ${JSON.stringify(data.spotify || "")},
  instagram: ${JSON.stringify(data.instagram || "")},
  youtube: ${JSON.stringify(data.youtube || "")},
  youtubeSubscribe: ${JSON.stringify(data.youtubeSubscribe || "")},
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

function generateEventsJs(data) {
  const itemsCode = data.map((item, index) => `  {
    id: ${item.id || index + 1},
    title: ${JSON.stringify(item.title || "")},
    date: ${JSON.stringify(item.date || "")},
    formattedDate: ${JSON.stringify(item.formattedDate || "")},
    time: ${JSON.stringify(item.time || "")},
    venue: ${JSON.stringify(item.venue || "")},
    city: ${JSON.stringify(item.city || "")},
    status: ${JSON.stringify(item.status || "Available")},
    category: ${JSON.stringify(item.category || "Public Concert")}
  }`).join(',\n');

  return `export const eventsContent = [\n${itemsCode}\n];`;
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

function generateSectionConfigJs(data) {
  return `export const sectionConfig = ${JSON.stringify(data, null, 2)};`;
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
        execSync('git push origin main', { cwd: ROOT_DIR });

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
          execSync('git push origin main', { cwd: ROOT_DIR });
          steps.push('Conflict resolved and pushed live!');
        } else if (strategy === 'use_restored') {
          steps.push('Resolving conflicts: Using target restored version (--theirs)...');
          execSync('git checkout --theirs .', { cwd: ROOT_DIR });
          execSync('git add .', { cwd: ROOT_DIR });
          execSync('git commit -m "Resolved merge conflict: Used restored version"', { cwd: ROOT_DIR });
          execSync('git push origin main', { cwd: ROOT_DIR });
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
      const { fields, files } = await parseMultipartForm(req);
      if (!files || files.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No file uploaded' }));
        return;
      }

      const uploadedFile = files[0];
      const ext = path.extname(uploadedFile.originalFilename) || '.bin';
      const cleanName = path.basename(uploadedFile.originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanName}_${Date.now()}${ext}`;
      const savePath = path.join(UPLOADS_DIR, filename);

      fs.writeFileSync(savePath, uploadedFile.buffer);

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

    // 7. POST /api/save-content
    if (pathname === '/api/save-content' && req.method === 'POST') {
      const body = await readJsonBody(req);
      
      if (body.hero) fs.writeFileSync(path.join(CONTENT_DIR, 'hero.js'), generateHeroJs(body.hero));
      if (body.about) fs.writeFileSync(path.join(CONTENT_DIR, 'about.js'), generateAboutJs(body.about));
      if (body.socials) fs.writeFileSync(path.join(CONTENT_DIR, 'socials.js'), generateSocialsJs(body.socials));
      if (body.audio) fs.writeFileSync(path.join(CONTENT_DIR, 'audio.js'), generateAudioJs(body.audio));
      if (body.events) fs.writeFileSync(path.join(CONTENT_DIR, 'events.js'), generateEventsJs(body.events));
      if (body.gallery) fs.writeFileSync(path.join(CONTENT_DIR, 'gallery.js'), generateGalleryJs(body.gallery));
      if (body.posts) fs.writeFileSync(path.join(CONTENT_DIR, 'posts.js'), generatePostsJs(body.posts));
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
        execSync('git add .', { cwd: ROOT_DIR });

        steps.push('Creating commit...');
        execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: ROOT_DIR });

        steps.push('Pushing to GitHub...');
        execSync('git push origin main', { cwd: ROOT_DIR });

        steps.push('Building & Deploying to GitHub Pages...');
        try {
          execSync('npm run deploy', { cwd: ROOT_DIR });
          steps.push('Deploy completed successfully!');
        } catch (deployErr) {
          console.error('Deploy warning:', deployErr.message);
          steps.push('Git pushed successfully (Deploy script noted: ' + deployErr.message.split('\n')[0] + ')');
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
      const filePath = path.join(ROOT_DIR, 'public', pathname);
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
});

