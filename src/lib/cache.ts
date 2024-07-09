import { DATA_CACHE_TIMEOUT_MS, KEY_CACHE_TIMEOUT_MS } from './constants';

let cachedKeys: { [key: string]: number } = {};
let cachedData: { [key: string]: [number, any] } = {};

let pools: { [key: string]: Set<string> } = {};
const GLOBAL_POOL = 'global';

function addToPool(pool: string, key: string) {
  if (!Object.keys(pools).includes(pool)) pools[pool] = new Set(key);
  pools[pool].add(key);
}

export function isKeyCached(key: string): boolean {
  return (
    Object.keys(cachedKeys).includes(key) && Date.now() - cachedKeys[key] < KEY_CACHE_TIMEOUT_MS
  );
}

export function cacheKey(key: string, pool: string = GLOBAL_POOL) {
  addToPool(pool, key);
  if (!Object.keys(cachedKeys).includes(key)) cachedKeys[key] = Date.now(); // don't update the last access time if the cache has been hit.
}

export function isDataCached(key: string): boolean {
  return (
    Object.keys(cachedData).includes(key) && Date.now() - cachedData[key][0] < DATA_CACHE_TIMEOUT_MS
  );
}

export function cacheData<T>(key: string, data: T, pool: string = GLOBAL_POOL): T {
  cachedData[key] = [Date.now(), data];
  addToPool(pool, key);
  return data;
}

export function getCachedData<T>(key: string): T {
  return cachedData[key][1];
}

export function invalidateDataCache(key: string) {
  delete cachedData[key];
}

export function invalidatePool(pool: string) {
  if (!Object.keys(pools).includes(pool)) return;
  pools[pool].forEach((key) => {
    delete cachedKeys[key];
    delete cachedData[key];
  });
}

export function clearCache() {
  cachedKeys = {};
  cachedData = {};
  pools = {};
}
