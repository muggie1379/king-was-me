// extract.js — pulls the two <script>...</script> blocks out of a KING WAS ME
// MVP HTML build and writes them as standalone script1.js / script2.js.
//
// Usage:
//   node extract.js /path/to/KING_WAS_ME_MVP_latest_vX.Y.Z.html
//
// Writes script1.js (round1 / 1회차 runtime) and script2.js (round2 / 2회차
// "Second Reading" runtime) into the same directory as this file.
// If the HTML only contains one <script> block, only script1.js is written.

const fs = require('fs');
const path = require('path');

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Usage: node extract.js <path-to-html>');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf8');

// Match every inline <script> block (no src=) in document order.
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const blocks = [];
let m;
while ((m = re.exec(html)) !== null) {
  const body = m[1].trim();
  if (body.length > 0) blocks.push(body);
}

if (blocks.length === 0) {
  console.error('No inline <script> blocks found in', htmlPath);
  process.exit(1);
}

const outDir = __dirname;
const names = ['script1.js', 'script2.js', 'script3.js'];

blocks.forEach((code, i) => {
  const name = names[i] || `script${i + 1}.js`;
  fs.writeFileSync(path.join(outDir, name), code, 'utf8');
  console.log(`Wrote ${name} (${code.length} bytes)`);
});

if (blocks.length !== 2) {
  console.warn(
    `\nWARNING: found ${blocks.length} inline <script> block(s), expected 2 ` +
    `(round1 + round2). Double-check nothing was added/removed structurally ` +
    `before assuming this is fine.`
  );
}
