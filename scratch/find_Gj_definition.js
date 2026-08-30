import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

const patterns = [
  /function Gj\(/i,
  /const Gj\s*=/i
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
    const end = Math.min(searchContent.length, idx + 1000); // print more lines
    console.log(`[Count ${count}] ... ${searchContent.substring(start, end).replace(/\n/g, ' ')} ...`);
    searchContent = searchContent.substring(idx + 1);
    count++;
  }
});
