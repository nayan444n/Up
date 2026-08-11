import splashImg from '../assets/images/xyporastk_splash_space_background.png';
import shootingImg from '../assets/images/Shooting page.png';

export const GAME_ASSETS = [
  { id: 'splash', src: splashImg },
  { id: 'shootingpage', src: shootingImg }
];

const imageCache: Map<string, HTMLImageElement> = new Map();

export function preloadAssets(
  onProgress?: (progress: number) => void
): Promise<boolean> {
  let loadedCount = 0;
  const total = GAME_ASSETS.length;

  return new Promise((resolve) => {
    let completed = false;

    const finish = () => {
      if (!completed) {
        completed = true;
        resolve(true);
      }
    };

    // Safety timeout in case image loading hangs.
    const timeout = window.setTimeout(() => finish(), 6000);

    GAME_ASSETS.forEach((asset) => {
      const img = new Image();
      img.src = asset.src;
      img.onload = () => {
        imageCache.set(asset.id, img);
        loadedCount++;
        onProgress?.(loadedCount / total);
        if (loadedCount >= total) {
          window.clearTimeout(timeout);
          finish();
        }
      };
      img.onerror = () => {
        loadedCount++;
        onProgress?.(loadedCount / total);
        if (loadedCount >= total) {
          window.clearTimeout(timeout);
          finish();
        }
      };
    });
  });
}

export function getCachedImage(id: string): HTMLImageElement | undefined {
  return imageCache.get(id);
}
