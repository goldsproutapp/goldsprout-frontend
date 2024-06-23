export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const KEY_CACHE_TIMEOUT_MS = 1000 * 60 * 2; // 2 minutes
export const DATA_CACHE_TIMEOUT_MS = 1000 * 60 * 2; // 2 minutes
export const DEFAULT_IMPORT_FORMAT = // same as CSV export
  'date,user,provider,stock_code,stock_name,region,sector,annual_fee,units,price,cost,value,absolute_change,normalised_performance';
