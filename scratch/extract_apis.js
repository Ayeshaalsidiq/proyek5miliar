import fs from 'fs';

const content = fs.readFileSync('scratch/gami-bundle.js', 'utf8');

// Look for API endpoints, fetch calls, base URLs, etc.
console.log("--- Scanning for URL patterns (http/https) ---");
const urlRegex = /https?:\/\/[^\s"'`>]+/g;
const urls = new Set(content.match(urlRegex) || []);
urls.forEach(url => console.log(url));

console.log("\n--- Scanning for relative API paths (/api/...) ---");
const apiPathRegex = /\/api\/[a-zA-Z0-9_\-\/]+/g;
const apiPaths = new Set(content.match(apiPathRegex) || []);
apiPaths.forEach(path => console.log(path));

console.log("\n--- Scanning for potential endpoint patterns ---");
const endpointRegex = /['"`](?:api)?\/[a-zA-Z0-9_\-\/]+['"`]/g;
const endpoints = new Set(content.match(endpointRegex) || []);
endpoints.forEach(ep => console.log(ep));
