import { logOut } from './auth';
import { cacheData, cacheKey, getCachedData, isDataCached, isKeyCached } from './cache';
import { API_BASE_URL } from './constants';
import { getProviderByID, getStockByID, getUserByID, getUserDisplayName } from './data';
import { processFormat } from './formats/csv';
import { authState, dataState } from './state';
import {
  type Snapshot,
  type Provider,
  type Stock,
  type User,
  type Overview,
  type Account
} from './types';

export async function authenticatedRequest(path: string, options?: RequestInit): Promise<Response> {
  let notNullOpts = options == null ? {} : options;
  const opts = Object.assign({}, notNullOpts, {
    headers: Object.assign({}, notNullOpts.headers || {}, {
      Authorization: `Bearer ${authState.token}`
    })
  });
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, opts);
  if (res.status === 401) {
    logOut(true);
  }
  return res;
}
export async function cachedRequest<T>(
  path: string,
  useCache: boolean = false,
  options?: RequestInit,
  cachePool?: string
): Promise<T | null> {
  if (useCache && isDataCached(path)) return getCachedData(path);
  const res = await authenticatedRequest(path, options);
  if (res.status !== 200) return null;
  const json = await res.json();
  cacheData(path, json, cachePool);
  return json;
}

export async function keyCachedRequestCacheLater(
  path: string,
  useCache: boolean,
  cachePool?: string
): Promise<[Response | null, () => void]> {
  if (useCache && isKeyCached(path)) {
    return [null, () => {}];
  }
  const res = await authenticatedRequest(path);
  return [res, () => cacheKey(path, cachePool)];
}

export async function keyCachedRequest(
  path: string,
  useCache: boolean = false,
  cachePool?: string
): Promise<Response | null> {
  const [res, cacheFunc] = await keyCachedRequestCacheLater(path, useCache, cachePool);
  cacheFunc();
  return res;
}

export async function getStockList(useCache: boolean = false): Promise<Stock[]> {
  const [res, cacheFunc] = await keyCachedRequestCacheLater('/stocks', useCache);
  if (res === null) return dataState.stocks;
  if (res.status != 200) return [];
  const json = await res.json();
  let stocks: Stock[] = json.reduce(
    (obj: Object, userStock: any) =>
      Object.assign(obj, {
        [userStock.stock.id]: { ...userStock.stock, users: new Set<number>(), accounts: [] }
      }),
    {}
  );
  json
    .filter((userStock: any) => userStock.currently_held)
    .forEach((userStock: any) => {
      stocks[userStock.stock.id].users.add(userStock.user_id);
      stocks[userStock.stock.id].accounts.push(userStock.account_id);
    });
  stocks = Object.values(stocks);
  await getProviderList(true);
  await Promise.all(
    stocks.map(async (stock: any) => {
      stock.provider = await getProviderByID(stock.provider_id, false);
    })
  );
  stocks.forEach((stock: any) => (stock.provider_name = stock.provider.name));
  stocks.forEach(
    (stock: any) => (stock.total_fee = (stock.annual_fee ?? 0) + (stock.provider.annual_fee ?? 0))
  );
  dataState.stocks = stocks;
  cacheFunc();
  return stocks;
}

export async function getProviderList(useCache: boolean = false): Promise<Provider[]> {
  const res = await keyCachedRequest('/providers', useCache);
  if (res === null) return dataState.providers;
  if (res.status != 200) return [];
  const json = await res.json();
  json.forEach((provider: Provider) => {
    provider.csv_format_obj = processFormat(provider.csv_format);
  });
  dataState.providers = json;
  return json;
}

export async function getSnapshots(
  useCache: boolean = false,
  timeframe: 'latest' | 'all' = 'latest'
): Promise<Snapshot[]> {
  await getUsers(useCache);
  await getStockList(useCache);
  const res = await keyCachedRequest(`/snapshots/${timeframe}`, useCache);
  if (res === null) return dataState[`snapshots_${timeframe}`];
  if (res.status != 200) return [];
  const json = await res.json();
  await Promise.all(
    json.map(async (snapshot: any) => {
      snapshot.date = new Date(snapshot.date);
      snapshot.user = await getUserByID(snapshot.user_id);
      snapshot.stock = await getStockByID(snapshot.stock_id);
      return snapshot;
    })
  );
  dataState[`snapshots_${timeframe}`] = json;
  return json;
}

export async function getUsers(useCache: boolean = false): Promise<User[]> {
  const res = await keyCachedRequest('/users', useCache);
  if (res === null) return dataState.users;
  if (res.status != 200) return [];
  const json = await res.json();
  json.created_at = new Date(json.created_at);
  dataState.users = json;
  return json;
}

export async function getUserVisibility(useCache: boolean = true): Promise<User[]> {
  const json = await cachedRequest<User[]>('/uservisibility', useCache);
  if (json === null) return [];
  return json;
}

export async function getOverview(useCache: boolean = true): Promise<Overview | null> {
  await getUsers(useCache);
  const json = await cachedRequest<Overview>('/overview', useCache);
  if (json === null) return null;
  json.last_snapshot = new Date(json.last_snapshot);
  if (json.users) {
    Object.keys(json.users).forEach(async (uid) => {
      // @ts-ignore I don't know why tsc can't recognise that json.users is not undefined.
      json.users[uid].last_snapshot = new Date(json.users[uid].last_snapshot);
      // @ts-ignore As above
      json.users[uid].name = getUserDisplayName(await getUserByID(parseInt(uid)));
    });
  }
  return json;
}
export async function getRegions(useCache: boolean = false): Promise<string[]> {
  const res = await keyCachedRequest('/regions', useCache);
  if (res === null) return dataState.regions;

  const json = await res.json();
  dataState.regions = json.regions;
  return dataState.regions;
}

export async function getSectors(useCache: boolean = false): Promise<string[]> {
  const res = await keyCachedRequest('/sectors', useCache);
  if (res === null) return dataState.sectors;
  const json = await res.json();
  dataState.sectors = json.sectors;
  return dataState.sectors;
}

export async function getHoldings(useCache: boolean = false) {
  const res = await keyCachedRequest('/holdings', useCache);
  if (res === null) return;
  const { data } = await res.json();
  dataState.userHoldings = data.by_user;
  dataState.stockHoldings = data.by_stock;
  dataState.accountHoldings = data.by_account;
}

export async function getAccounts(useCache: boolean = false): Promise<Account[]> {
  const [res, cacheFunc] = await keyCachedRequestCacheLater('/accounts', useCache);
  if (res === null) return dataState.accounts;
  const json = await res.json();
  const accounts = json.data;
  await getUsers(true);
  await getProviderList(true);
  await Promise.all(
    accounts.map(async (account: Account) => {
      account.provider = await getProviderByID(account.provider_id, false);
      account.user = await getUserByID(account.user_id, false);
    })
  );
  dataState.accounts = accounts;
  cacheFunc();
  return dataState.accounts;
}
