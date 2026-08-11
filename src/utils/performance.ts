export interface PerformanceSnapshot {
  fps: number;
  frameMs: number;
  droppedFrames: number;
  quality: 'HIGH' | 'MED' | 'LOW';
}

let last = 0;
let frames = 0;
let dropped = 0;
let windowStart = 0;

export function getRecommendedQuality(): 'HIGH' | 'MED' | 'LOW' {
  try {
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency || 4;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;

    if (connection?.saveData || (typeof memory === 'number' && memory <= 2) || cores <= 2) return 'LOW';
    if ((typeof memory === 'number' && memory <= 4) || cores <= 4) return 'MED';
  } catch {}
  return 'HIGH';
}

export function hasExplicitQualitySetting(): boolean {
  try { return localStorage.getItem('galaxy_graphics_quality') !== null; } catch { return false; }
}

export function sampleFrame(now: number): PerformanceSnapshot {
  if (!windowStart) windowStart = now;
  const frameMs = last ? now - last : 16.67;
  last = now;
  frames += 1;
  if (frameMs > 34) dropped += 1;
  if (now - windowStart >= 1000) {
    const fps = frames;
    frames = 0;
    windowStart = now;
    const snapshot = { fps, frameMs, droppedFrames: dropped, quality: getSavedQuality() };
    dropped = 0;
    try { localStorage.setItem('galaxy_last_perf', JSON.stringify(snapshot)); } catch {}
    return snapshot;
  }
  return { fps: Math.round(1000 / Math.max(1, frameMs)), frameMs, droppedFrames: dropped, quality: getSavedQuality() };
}

export function getSavedQuality(): 'HIGH' | 'MED' | 'LOW' {
  try {
    const value = localStorage.getItem('galaxy_graphics_quality');
    if (value === 'LOW' || value === 'MED' || value === 'HIGH') return value;
    return getRecommendedQuality();
  } catch { return 'LOW'; }
}

export function getLastPerformanceSnapshot(): PerformanceSnapshot | null {
  try {
    const raw = localStorage.getItem('galaxy_last_perf');
    return raw ? JSON.parse(raw) as PerformanceSnapshot : null;
  } catch { return null; }
}
