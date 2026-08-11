import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const errors = [];
const app = read('src/App.tsx');
const debug = read('src/components/DebugPanel.tsx');
if (!/import\.meta\.env\.DEV/.test(app)) errors.push('App debug mode is not DEV-gated');
if (!/import\.meta\.env\.DEV/.test(debug)) errors.push('DebugPanel is not DEV-gated');
if (!fs.existsSync(path.join(root, 'THIRD_PARTY_LICENSES.md'))) errors.push('Third-party licenses file missing');
if (!fs.existsSync(path.join(root, 'COPYRIGHT_AUDIT.md'))) errors.push('Copyright audit missing');
if (!fs.existsSync(path.join(root, 'scripts/release-audit.mjs'))) errors.push('Release audit script missing');
if (errors.length) { console.error('Release security: FAIL'); errors.forEach(e => console.error(' - ' + e)); process.exit(1); }
console.log('Release security: PASS');
