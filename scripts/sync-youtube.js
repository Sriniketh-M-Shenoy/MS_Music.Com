// Node script to sync YouTube videos and shorts from @muralidharshenoykochi
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const videosPath = path.resolve(__dirname, '..', 'src', 'content', 'videos.js');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9'
};

// Helper: parse relative time string into an approximate YYYY-MM-DD
export function parseRelativeTime(timeAgo) {
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

export function sortMediaChronological(items) {
  if (!Array.isArray(items)) return [];
  return [...items].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

export async function fetchYouTubeMedia() {
  console.log('[Sync YouTube] Starting sync for @muralidharshenoykochi...');

  // Map to store existing metadata (exact dates, custom items, etc.)
  const existingMap = new Map();
  let customItems = [];

  if (fs.existsSync(videosPath)) {
    try {
      const raw = fs.readFileSync(videosPath, 'utf-8');
      const match = raw.match(/export const videosContent = (\[[\s\S]*?\]);/);
      if (match) {
        // eslint-disable-next-line no-eval
        const existing = eval(match[1]);
        if (Array.isArray(existing)) {
          for (const item of existing) {
            if (item && item.videoId) {
              existingMap.set(item.videoId, item);
              if (item.isCustom) {
                customItems.push(item);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Sync YouTube] Error reading existing videos:', e.message);
    }
  }

  const scrapedVideos = [];
  const scrapedShorts = [];

  // 1. Fetch Videos tab
  try {
    const vRes = await fetch('https://www.youtube.com/@muralidharshenoykochi/videos', { headers: HEADERS });
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
    console.error('[Sync YouTube] Error fetching videos tab:', err.message);
  }

  // 2. Fetch Shorts tab
  try {
    const sRes = await fetch('https://www.youtube.com/@muralidharshenoykochi/shorts', { headers: HEADERS });
    if (sRes.ok) {
      const sHtml = await sRes.text();
      const sMatch = sHtml.match(/ytInitialData\s*=\s*({.*?});<\/script>/s) || sHtml.match(/var ytInitialData = ({.*?});<\/script>/s);
      if (sMatch) {
        const sData = JSON.parse(sMatch[1]);
        function extractShorts(obj) {
          if (!obj || typeof obj !== 'object') return;
          if (obj.shortsLockupViewModel) {
            const vm = obj.shortsLockupViewModel;
            const videoId = vm.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId || (vm.entityId || '').replace('shorts-shelf-item-', '');
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
    console.error('[Sync YouTube] Error fetching shorts tab:', err.message);
  }

  console.log(`[Sync YouTube] Scraped ${scrapedVideos.length} videos and ${scrapedShorts.length} shorts.`);

  // 3. Resolve exact publish dates for all items
  const finalItems = [];

  // Add custom uploads created via studio app
  for (const item of customItems) {
    finalItems.push(item);
  }

  // Process videos
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

  // Process shorts - fetch exact publish dates for new shorts in small concurrent batches
  const shortsToFetch = [];
  for (let i = 0; i < scrapedShorts.length; i++) {
    const s = scrapedShorts[i];
    const cached = existingMap.get(s.videoId);
    if (!cached || !cached.date) {
      shortsToFetch.push({ ...s, originalIndex: i });
    }
  }

  if (shortsToFetch.length > 0) {
    console.log(`[Sync YouTube] Resolving exact dates for ${shortsToFetch.length} new/uncached shorts...`);
    const BATCH_SIZE = 6;
    for (let i = 0; i < shortsToFetch.length; i += BATCH_SIZE) {
      const batch = shortsToFetch.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (item) => {
        try {
          const res = await fetch(`https://www.youtube.com/shorts/${item.videoId}`, {
            headers: HEADERS,
            signal: AbortSignal.timeout(6000)
          });
          if (res.ok) {
            const html = await res.text();
            const m = html.match(/"datePublished":\s*"([^"]+)"/) || html.match(/"uploadDate":\s*"([^"]+)"/);
            if (m && m[1]) {
              item.resolvedDate = m[1].split('T')[0];
            }
          }
        } catch (e) {
          // Fallback handled below
        }
      }));
    }
  }

  for (let i = 0; i < scrapedShorts.length; i++) {
    const s = scrapedShorts[i];
    const cached = existingMap.get(s.videoId);
    const fetched = shortsToFetch.find(x => x.videoId === s.videoId);
    let date = fetched?.resolvedDate || cached?.date;

    // Fallback: if date couldn't be resolved, estimate based on channel order
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

  // 4. Sort strictly chronologically descending (newest first)
  const sortedFinalItems = sortMediaChronological(finalItems);

  const code = `// Automatically synced YouTube videos & shorts from @muralidharshenoykochi\nexport const videosContent = ${JSON.stringify(sortedFinalItems, null, 2)};\n`;
  fs.writeFileSync(videosPath, code, 'utf-8');
  console.log(`[Sync YouTube] Successfully synced ${sortedFinalItems.length} videos & shorts in chronological order!`);
  return sortedFinalItems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchYouTubeMedia().catch(err => {
    console.error('[Sync YouTube] Fatal error:', err);
    process.exit(1);
  });
}
