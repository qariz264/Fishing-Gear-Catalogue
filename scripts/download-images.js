import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.resolve('public/images/products');
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const ITEMS = [
  { id: 'reel-tx-2000-spin', search: 'spinning fishing reel', fallbackTitle: 'File:Fishing-spinning-reel.JPG' },
  { id: 'reel-km-3000-spin', search: '3000 sized spinning reel', fallbackTitle: 'File:A 3000 sized spinning reel.jpg' },
  { id: 'reel-chrome-ultralight-spin', search: 'spinning reel silver', fallbackTitle: 'File:Spinning fishing reel without line.jpg' },
  { id: 'reel-stealth-charcoal-gold-baitcaster', search: 'baitcasting reel', fallbackTitle: 'File:Baitcasting reel.jpg' },
  { id: 'reel-tricolor-crimson-baitcaster', search: 'baitcaster reel low profile', fallbackTitle: 'File:Baitcasting reel.jpg' },
  { id: 'reel-tricolor-cobalt-baitcaster', search: 'baitcasting reel fishing', fallbackTitle: 'File:Baitcasting reel.jpg' },
  { id: 'reel-tricolor-yellow-baitcaster', search: 'baitcaster', fallbackTitle: 'File:Baitcasting reel.jpg' },
  
  { id: 'rod-classic-cork-spin', search: 'spinning fishing rod cork', fallbackTitle: 'File:Fishing rod and reel.jpg' },
  { id: 'rod-muriyu-zhb-540', search: 'telescopic fishing rod', fallbackTitle: 'File:Fishing rod.jpg' },
  { id: 'rod-saltwater-blue-game', search: 'boat fishing rod saltwater', fallbackTitle: 'File:Fishing rod and reel.jpg' },
  { id: 'rod-copper-orange-lure', search: 'fishing rod lure', fallbackTitle: 'File:Fishing rod and reel.jpg' },
  { id: 'rod-carbon-monocoque-pro', search: 'carbon fiber fishing rod', fallbackTitle: 'File:Fishing rod.jpg' },
  { id: 'rod-teal-ultralight-stream', search: 'ultralight fishing rod', fallbackTitle: 'File:Fishing rod and reel.jpg' },
  { id: 'rod-stealth-finesse-trigger', search: 'casting fishing rod', fallbackTitle: 'File:Fishing rod and reel.jpg' },

  { id: 'lure-rat-l-trap-chrome', search: 'crankbait lure', fallbackTitle: 'File:Crankbait.jpg' },
  { id: 'lure-rat-l-trap-firetiger', search: 'crankbait firetiger', fallbackTitle: 'File:Fishing lure.jpg' },
  { id: 'lure-rat-l-trap-white-shad', search: 'fishing plug lure', fallbackTitle: 'File:Fishing lure.jpg' },
  { id: 'lure-xuantu-jointed-swimbait', search: 'jointed fishing lure swimbait', fallbackTitle: 'File:Rapala lure.jpg' },
  { id: 'lure-senko-ribbed-stickbait', search: 'soft plastic fishing lure worm', fallbackTitle: 'File:Plastic worm.jpg' },

  { id: 'terminal-carbon-circle-hooks', search: 'fishing hooks', fallbackTitle: 'File:Fishing hooks.jpg' },
  { id: 'net-aluminum-hand-landing', search: 'fishing landing net', fallbackTitle: 'File:Landing net.jpg' },
];

async function getImageUrl(title) {
  try {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=imageinfo&iiprop=url&format=json';
    const res = await fetch(url, { headers: { 'User-Agent': 'FishWithNelsonApp/1.0 (contact@fishwithnelson.co.ke)' } });
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;
    const page = Object.values(pages)[0];
    return page?.imageinfo?.[0]?.url || null;
  } catch (e) {
    return null;
  }
}

async function searchImage(query) {
  try {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(query) + '&srnamespace=6&format=json';
    const res = await fetch(url, { headers: { 'User-Agent': 'FishWithNelsonApp/1.0 (contact@fishwithnelson.co.ke)' } });
    const data = await res.json();
    const results = data.query?.search;
    if (results && results.length > 0) {
      return results[0].title;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function downloadFile(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'FishWithNelsonApp/1.0 (contact@fishwithnelson.co.ke)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(buffer));
}

async function main() {
  console.log('Downloading real fishing product photos from verified sources...');
  for (const item of ITEMS) {
    const outPath = path.join(TARGET_DIR, `${item.id}.jpg`);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
      console.log(`Skipping ${item.id}, already exists`);
      continue;
    }

    let title = await searchImage(item.search);
    if (!title) {
      title = item.fallbackTitle;
    }

    let imgUrl = title ? await getImageUrl(title) : null;
    if (!imgUrl && item.fallbackTitle) {
      imgUrl = await getImageUrl(item.fallbackTitle);
    }

    if (imgUrl) {
      try {
        console.log(`Downloading for ${item.id} from ${imgUrl}...`);
        await downloadFile(imgUrl, outPath);
        console.log(`✓ Saved ${item.id}.jpg (${fs.statSync(outPath).size} bytes)`);
      } catch (err) {
        console.error(`Failed to download for ${item.id}:`, err.message);
      }
    } else {
      console.warn(`No image found for ${item.id}`);
    }
  }
}

main();
