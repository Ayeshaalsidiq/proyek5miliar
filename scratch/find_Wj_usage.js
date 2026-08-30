import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

let idx = -1;
let count = 0;
while ((idx = content.indexOf('Wj', idx + 1)) !== -1) {
  const start = Math.max(0, idx - 200);
  const end = Math.min(content.length, idx + 200);
  console.log(`[Pos ${idx}] ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
  count++;
  if (count > 20) break;
}
