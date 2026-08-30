import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

const targetIndex = 525488; // from match Pos 525488
const start = Math.max(0, targetIndex - 2000);
const end = Math.min(content.length, targetIndex + 500);

console.log(content.substring(start, end).replace(/\n/g, ' '));
