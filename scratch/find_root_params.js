import fs from 'fs';

let content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

// Let's search for "window.location" or "URLSearchParams" (case-insensitive or split)
const regexes = [
  /URLSearchParams/i,
  /window\.location/i,
  /location\./i,
  /queryParams/i,
  /user_id/i,
  /userId/i
];

regexes.forEach(regex => {
  console.log(`\n--- Matches for regex: ${regex} ---`);
  let searchContent = content;
  let idx = -1;
  let count = 0;
  while (count < 5) {
    idx = searchContent.search(regex);
    if (idx === -1) break;
    const start = Math.max(0, idx - 100);
    const end = Math.min(searchContent.length, idx + 100);
    console.log(`[Count ${count}] ... ${searchContent.substring(start, end).replace(/\n/g, ' ')} ...`);
    searchContent = searchContent.substring(idx + 1);
    count++;
  }
});
