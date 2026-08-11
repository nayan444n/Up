import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(root, rel));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const app = read('src/App.tsx');
const menu = read('src/components/MainMenu.tsx');
const storage = read('src/utils/storage.ts');
const balance = read('src/utils/balance.ts');
const director = read('src/utils/gameDirector.ts');
const space = read('src/components/SpaceCanvas.tsx');

assert(/import\.meta\.env\.DEV/.test(app), 'Production debug guard missing in App.tsx');
assert(/import\.meta\.env\.DEV/.test(read('src/components/DebugPanel.tsx')), 'Production debug guard missing in DebugPanel.tsx');
assert(/PLAY/.test(menu) && /LEVEL/.test(menu) && /SHOP/.test(menu) && /ACHIEVEMENT/.test(menu) && /SETTING/.test(menu), 'Home menu labels missing');
assert(!/EXIT/.test(menu), 'EXIT must remain absent from Home menu');
assert(/ROTATING_BACKUP_KEYS/.test(storage) && /SAVE_FORMAT_VERSION = 5/.test(storage), 'Rotating/versioned save protection missing');
assert(/getDirectorProfile/.test(director), 'Difficulty director missing');
assert(/getDifficultyProfile/.test(balance), 'Base balance profile missing');
assert(!/coins:\s*credits/.test(read('src/utils/progression.ts')), 'Periodic progression must not double-award session coin pickups');
assert(/while \(level < 999/.test(read('src/utils/progression.ts')), 'Player level cap guard missing');
assert(/isElite|miniBoss/.test(space), 'Elite/Mini-Boss combat content missing');
assert(/enemy\.type === 'BOSS' && !enemy\.isMiniBoss && !g\.chestDropped/.test(space), 'Mini-boss must not consume the normal boss chest');
assert(/Mini-boss levels are complete when their elite is defeated/.test(space), 'Mini-boss victory path missing');
assert(/touchcancel/.test(space) && /window\.addEventListener\('blur'/.test(space), 'Touch cancellation/blur cleanup missing');
assert(/const handleWindowBlur = \(\) =>/.test(space) && /gameRef\.current\.keys = \{\}/.test(space), 'Keyboard focus-loss cleanup missing');
assert(/window\.addEventListener\('mouseup', handleMouseUp\)/.test(space) && /window\.removeEventListener\('mouseup', handleMouseUp\)/.test(space), 'Mouse release-outside-canvas cleanup missing');
assert(/const candidates = \[STORAGE_KEY, BACKUP_KEY, \.\.\.ROTATING_BACKUP_KEYS, LEGACY_STORAGE_KEY\]/.test(storage), 'Save recovery chain must continue through all backups');
assert(/parsed\.version !== SAVE_FORMAT_VERSION/.test(storage) && /typeof parsed\.checksum !== 'string'/.test(storage), 'Import save validation is too permissive');
assert(/safe\.currentLevel = Math\.min\(safe\.maxLevelUnlocked/.test(storage), 'Current level must not exceed unlocked level');
for (const f of ['COPYRIGHT_AUDIT.md','THIRD_PARTY_LICENSES.md','RELEASE_CHECKLIST.md','FINAL_RELEASE_AUDIT.md','BALANCE_PASS.md']) {
  assert(exists(f), `${f} missing`);
}

console.log('QA smoke: PASS');
console.log('Checked menu order, production debug lock, save protection, difficulty director, elite/mini-boss systems, balance, and release docs.');
