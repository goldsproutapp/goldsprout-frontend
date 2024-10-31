export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const DEMO_MODE_ENABLED = import.meta.env.VITE_DEMO_MODE_ENABLED == 'true';

export const KEY_CACHE_TIMEOUT_MS = 1000 * 60 * 2; // 2 minutes
export const DATA_CACHE_TIMEOUT_MS = 1000 * 60 * 2; // 2 minutes
export const DEFAULT_IMPORT_FORMAT =
  'date,user,provider,account,,stock_code,stock_name,region,sector,annual_fee,units,price,cost,value,absolute_change';

export const PAGINATOR_PAGE_OPTIONS = [10, 20, 50, 100];
