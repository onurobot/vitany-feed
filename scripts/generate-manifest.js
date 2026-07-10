/*
 * generate-manifest.js
 * public/media/ altındaki her klasörü tarar, içeriğe göre tipi belirler
 * (video → reels, çoklu görsel → carousel, tek görsel → post),
 * content.json'daki caption/bölüm bilgisiyle birleştirip public/feed.json yazar.
 * Vercel build sırasında otomatik çalışır.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MEDIA_DIR = path.join(ROOT, 'public', 'media');
const CONTENT = path.join(ROOT, 'content.json');
const OUT = path.join(ROOT, 'public', 'feed.json');

const IMG = /\.(jpe?g|png|webp|gif|avif|bmp)$/i;
const VID = /\.(mp4|mov|webm|m4v)$/i;
const numOf = s => { const m = s.match(/\d+/); return m ? parseInt(m[0], 10) : null; };
const natSort = (a, b) => {
  const na = (a.match(/\d+/) || [])[0], nb = (b.match(/\d+/) || [])[0];
  if (na && nb) return parseInt(na) - parseInt(nb);
  return a.localeCompare(b, 'tr');
};

const content = JSON.parse(fs.readFileSync(CONTENT, 'utf8'));

let folders = [];
try {
  folders = fs.readdirSync(MEDIA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a, b) => {
      const na = numOf(a), nb = numOf(b);
      if (na != null && nb != null) return na - nb;
      return a.localeCompare(b, 'tr');
    });
} catch (e) { /* media klasörü henüz yoksa placeholder ile devam */ }

const mediaByN = {};
folders.forEach((folder, i) => {
  const dir = path.join(MEDIA_DIR, folder);
  let files = fs.readdirSync(dir).filter(f => IMG.test(f) || VID.test(f));
  if (!files.length) return;
  files.sort(natSort);
  const num = numOf(folder);
  const idx = (num && num >= 1 && num <= content.posts.length) ? num : (i + 1);
  const videos = files.filter(f => VID.test(f));
  const images = files.filter(f => IMG.test(f));
  let type, ordered;
  if (videos.length) { type = 'reels'; ordered = [...videos, ...images]; }
  else if (images.length > 1) { type = 'carousel'; ordered = images; }
  else { type = 'post'; ordered = images; }
  mediaByN[idx] = { type, files: ordered.map(f => `media/${folder}/${f}`) };
});

const posts = content.posts.map(p => {
  const m = mediaByN[p.n];
  return { ...p, resolvedType: m ? m.type : null, media: m ? m.files : [] };
});

const feed = {
  profile: content.profile,
  generatedAt: new Date().toISOString(),
  posts
};

fs.writeFileSync(OUT, JSON.stringify(feed, null, 2));
const matched = Object.keys(mediaByN).length;
console.log(`✓ feed.json yazıldı — ${matched}/${content.posts.length} klasör eşleşti.`);
if (matched) {
  Object.keys(mediaByN).sort((a,b)=>a-b).forEach(n =>
    console.log(`  0${n} → ${mediaByN[n].type} (${mediaByN[n].files.length} dosya)`));
} else {
  console.log('  (Henüz medya yok — placeholder modunda yayınlanacak.)');
}
