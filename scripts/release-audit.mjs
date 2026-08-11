import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const assetDir = path.join(root, 'src', 'assets');
const sourceDir = path.join(root, 'src');
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full); else files.push(full);
  }
}
walk(assetDir);
const binary = /\.(png|jpe?g|webp|gif|mp3|wav|ogg|m4a)$/i;
const inventory = files.filter(f => binary.test(f)).map(f => {
  const data = fs.readFileSync(f);
  return { file: path.relative(root, f), bytes: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex') };
});
const sourceText = sourceFilesText();
function sourceFilesText() {
  const out = [];
  function walkText(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walkText(full);
      else if (/\.(tsx?|css|html)$/i.test(full)) {
        try { out.push(fs.readFileSync(full, 'utf8')); } catch {}
      }
    }
  }
  walkText(sourceDir);
  return out.join('\n');
}
const unusedAssets = inventory.filter(item => {
  const base = path.basename(item.file);
  return !sourceText.includes(base);
});
const sourceFiles = [];
function walkInto(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkInto(full, out); else out.push(full);
  }
}
walkInto(sourceDir, sourceFiles);
const externalUrls = [];
for (const file of sourceFiles.filter(f => /\.(tsx?|css|html|md)$/i.test(f))) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/https?:\/\/[^\s'"`)>]+/g)) {
    const url = match[0].replace(/[.,;]+$/, '');
    // Ignore embedded SVG namespace declarations and documentation placeholders.
    if (url === 'http://www.w3.org/2000/svg' || url.includes('YOUR-LIVE-DOMAIN.example')) continue;
    externalUrls.push({ file: path.relative(root, file), url });
  }
}
const report = {
  generatedAt: new Date().toISOString(),
  assetCount: inventory.length,
  assets: inventory,
  externalUrls,
  unusedAssets,
  notes: [
    'This is an automated engineering audit, not legal advice.',
    'Every non-original asset must have a creator/license record before commercial distribution.',
    'Localization/device compatibility audits are intentionally excluded from this release batch.'
  ]
};
fs.writeFileSync(path.join(root, 'RELEASE_ASSET_MANIFEST.json'), JSON.stringify(report, null, 2));
console.log(`Release audit: ${inventory.length} binary assets, ${externalUrls.length} external URL references, ${unusedAssets.length} unused assets.`);
if (unusedAssets.length) {
  console.error('Release audit: FAIL - unused binary assets detected:');
  unusedAssets.forEach((item) => console.error(` - ${item.file}`));
  process.exitCode = 1;
}
