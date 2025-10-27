import fs from 'fs';
import path from 'path';

// Path to the public folder
const publicDir = path.join(process.cwd(), 'public');
const redirectsFile = path.join(publicDir, '_redirects');

// Redirect rules
const redirectsContent = `
/api/*  https://repo-backend-lpiu.onrender.com/api/:splat  200
/uploads/*  https://repo-backend-lpiu.onrender.com/uploads/:splat  200
/*  /index.html  200
`.trim();

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write _redirects file
fs.writeFileSync(redirectsFile, redirectsContent, 'utf8');

console.log(`✅ _redirects file created at ${redirectsFile}`);
