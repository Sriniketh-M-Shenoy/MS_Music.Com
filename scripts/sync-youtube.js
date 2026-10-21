// Node script to sync YouTube videos and shorts from @muralidharshenoykochi
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const videosPath = path.resolve(__dirname, '..', 'src', 'content', 'videos.js');

export async function fetchYouTubeMedia() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  let items = [];

  // Read existing custom items if any
  if (fs.existsSync(videosPath)) {
    try {
      const raw = fs.readFileSync(videosPath, 'utf-8');
      const match = raw.match(/export const videosContent = (\[[\s\S]*?\]);/);
      if (match) {
        // eslint-disable-next-line no-eval
        const existing = eval(match[1]);
        if (Array.isArray(existing)) {
          // Keep custom items uploaded directly through app
          items = existing.filter(x => x && x.isCustom);
        }
      }
    } catch (e) {
      console.warn('Error reading existing videos:', e.message);
    }
  }

  // 1. Fetch Videos
  try {
    const vRes = await fetch('https://www.youtube.com/@muralidharshenoykochi/videos', { headers });
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
          if (videoId && title && !items.find(x => x.videoId === videoId)) {
            let dateScore = Date.now();
            if (timeAgo.includes('day')) {
              dateScore -= (parseInt(timeAgo) || 1) * 24 * 3600 * 1000;
            } else if (timeAgo.includes('week')) {
              dateScore -= (parseInt(timeAgo) || 1) * 7 * 24 * 3600 * 1000;
            } else if (timeAgo.includes('month')) {
              dateScore -= (parseInt(timeAgo) || 1) * 30 * 24 * 3600 * 1000;
            } else if (timeAgo.includes('year')) {
              dateScore -= (parseInt(timeAgo) || 1) * 365 * 24 * 3600 * 1000;
            }
            const dateStr = new Date(dateScore).toISOString().split('T')[0];

            items.push({
              id: `yt-${videoId}`,
              videoId,
              title,
              type: 'Video',
              platform: 'YouTube',
              date: dateStr,
              views: views ? `${views} views` : '',
              timeAgo: timeAgo || 'Recent',
              url: `https://www.youtube.com/watch?v=${videoId}`,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              description: 'Official vocal performance by Muralidhar Shenoy on YouTube.'
            });
          }
        }
        for (const k of Object.keys(obj)) extractVideos(obj[k]);
      }
      extractVideos(vData);
    }
  } catch (err) {
    console.error('Error fetching YouTube videos:', err.message);
  }

  // 2. Fetch Shorts
  try {
    const sRes = await fetch('https://www.youtube.com/@muralidharshenoykochi/shorts', { headers });
    const sHtml = await sRes.text();
    const sMatch = sHtml.match(/ytInitialData\s*=\s*({.*?});<\/script>/s) || sHtml.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (sMatch) {
      const sData = JSON.parse(sMatch[1]);
      function extractShorts(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (obj.shortsLockupViewModel) {
          const vm = obj.shortsLockupViewModel;
          const entityId = vm.entityId || '';
          const videoId = entityId.replace('shorts-shelf-item-', '') || vm.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId;
          let title = vm.overlayMetadata?.primaryText?.content || '';
          if (!title && vm.accessibilityText) {
            title = vm.accessibilityText.split(',')[0] || '';
          }
          let views = '';
          if (vm.accessibilityText && vm.accessibilityText.includes('views')) {
            const parts = vm.accessibilityText.split(',');
            if (parts[1]) views = parts[1].replace('– play Short', '').trim();
          }
          if (videoId && title && !items.find(x => x.videoId === videoId)) {
            const dateStr = new Date(Date.now() - (items.length * 3600 * 1000 * 6)).toISOString().split('T')[0];
            items.push({
              id: `yt-short-${videoId}`,
              videoId,
              title,
              type: 'Short',
              platform: 'YouTube',
              date: dateStr,
              views: views || '',
              timeAgo: 'Recent Short',
              url: `https://www.youtube.com/shorts/${videoId}`,
              thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
              description: 'YouTube Short performance clip by Muralidhar Shenoy.'
            });
          }
        }
        for (const k of Object.keys(obj)) extractShorts(obj[k]);
      }
      extractShorts(sData);
    }
  } catch (err) {
    console.error('Error fetching YouTube shorts:', err.message);
  }

  // Sort by date descending (newest first)
  items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const code = `// Automatically synced YouTube videos & shorts from @muralidharshenoykochi\nexport const videosContent = ${JSON.stringify(items, null, 2)};\n`;
  fs.writeFileSync(videosPath, code, 'utf-8');
  console.log(`[Sync YouTube] Successfully synced ${items.length} videos & shorts!`);
  return items;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchYouTubeMedia();
}
