import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

const regex = /localStorage\.setItem/g;
let idx = -1;
let count = 0;
while ((idx = content.indexOf('localStorage.setItem', idx + 1)) !== -1) {
  const start = Math.max(0, idx - 100);
  const end = Math.min(content.length, idx + 150);
  console.log(`[Pos ${idx}] ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
  count++;
}
