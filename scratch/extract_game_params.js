import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

// Search for window.location search or query params, searchParams, local storage, etc.
const keywords = ['searchParams', 'location.search', 'localStorage', 'getItem', 'userId', 'user_id', 'player', 'meja'];

keywords.forEach(kw => {
  console.log(`\n--- Matches for keyword: "${kw}" ---`);
  let idx = -1;
  while ((idx = content.indexOf(kw, idx + 1)) !== -1) {
    const start = Math.max(0, idx - 100);
    const end = Math.min(content.length, idx + kw.length + 100);
    console.log(`[Pos ${idx}] ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
  }
});
