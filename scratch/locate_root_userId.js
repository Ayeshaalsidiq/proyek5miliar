import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

// Find all places where Wj is used, or search for "userId:" or "userId =" or similar
const patterns = [
  /<Wj/i,
  /Wj\(/i,
  /userId:/i,
  /userId\s*=/i,
  /localStorage\.getItem\(['"]user/i,
  /sessionStorage/i
];

patterns.forEach(pattern => {
  console.log(`\n--- Matches for pattern: ${pattern} ---`);
  let searchContent = content;
  let idx = -1;
  let count = 0;
  while (count < 5) {
    idx = searchContent.search(pattern);
    if (idx === -1) break;
    const start = Math.max(0, idx - 100);
    const end = Math.min(searchContent.length, idx + 100);
    console.log(`[Count ${count}] ... ${searchContent.substring(start, end).replace(/\n/g, ' ')} ...`);
    searchContent = searchContent.substring(idx + 1);
    count++;
  }
});
