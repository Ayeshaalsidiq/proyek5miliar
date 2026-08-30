import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

const regex = /postMessage/g;
let idx = -1;
let count = 0;
while ((idx = content.indexOf('postMessage', idx + 1)) !== -1) {
  const start = Math.max(0, idx - 150);
  const end = Math.min(content.length, idx + 150);
  console.log(`[Pos ${idx}] ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
  count++;
}
