import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

// Find occurrences of "/api/" or "geasture.kolab.top" and print 100 characters before and after.
const searchTerms = ['/api/', 'geasture.kolab.top', 'patungan', 'study-sessions'];

searchTerms.forEach(term => {
  console.log(`\n--- Matches for term: "${term}" ---`);
  let idx = -1;
  while ((idx = content.indexOf(term, idx + 1)) !== -1) {
    const start = Math.max(0, idx - 150);
    const end = Math.min(content.length, idx + term.length + 150);
    console.log(`[Pos ${idx}] ... ${content.substring(start, end).replace(/\n/g, ' ')} ...`);
  }
});
