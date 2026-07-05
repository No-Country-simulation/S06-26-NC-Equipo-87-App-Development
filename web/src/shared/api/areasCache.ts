import { getRequest } from './apiClient';

let areasCache: string[] | null = null;
let areasPromise: Promise<string[]> | null = null;

export const getCachedAreas = async (): Promise<string[]> => {
  if (areasCache) {
    return areasCache;
  }
  if (!areasPromise) {
    areasPromise = getRequest<{ name: string }[]>('/api/areas')
      .then((data) => {
        areasCache = data.map((a) => a.name);
        return areasCache;
      })
      .catch((err) => {
        areasPromise = null;
        throw err;
      });
  }
  return areasPromise;
};

export const clearAreasCache = (): void => {
  areasCache = null;
  areasPromise = null;
};

if (typeof afterEach === 'function') {
  afterEach(() => {
    clearAreasCache();
  });
}
