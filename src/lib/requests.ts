import {logOut} from "./auth";
import {API_BASE_URL} from "./constants";
import {getStockByID, getUserByID} from "./data";
import {authState, dataState} from "./state";
import {type Snapshot, type Provider, type Stock, type User} from "./types";

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
export async function cachedRequest(path: string, options?: RequestInit): Promise<Response> {
    // TODO: actually cache requests, or decide that it's a bad idea.
    return authenticatedRequest(path, options);
}

export async function getStockList(): Promise<Stock[]> {
    const res = await cachedRequest('/stocks');
    if (res.status != 200) return [];
    const json = await res.json();
    const providers = await getProviderList();
    let stocks = json.reduce((obj: Object, userStock: any) => Object.assign(obj, {[userStock.stock.id]: {...userStock.stock, users: []}}), {});
    json.forEach((userStock: any) => stocks[userStock.stock.id].users.push(userStock.user_id));
    stocks = Object.values(stocks);
    stocks.forEach((stock: any) => stock.provider = providers.find(provider => provider.id == stock.provider_id));
    stocks.forEach((stock: any) => stock.provider_name = stock.provider.name);
    dataState.stocks = stocks;
    return stocks;
}

export async function getProviderList(): Promise<Provider[]> {
    const res = await cachedRequest('/providers');
    if (res.status != 200) return [];
    const json = await res.json();
    json.forEach((provider: Provider) => {
        provider.csv_format_obj = {};
        provider.csv_format.split(",").forEach((heading, i) => {
            if (heading !== '_') provider.csv_format_obj[heading] = i
        });
    });
    dataState.providers = json;
    return json;
}

export async function getSnapshots(timeframe: 'latest' | 'all' = 'latest'): Promise<Snapshot[]> {
    await getUsers();
    await getStockList();
    const res = await cachedRequest(`/snapshots/${timeframe}`);
    if (res.status != 200) return [];
    const json = await res.json();
    await Promise.all(json.map(async (snapshot: any) => {
        snapshot.date = new Date(snapshot.date);
        snapshot.user = await getUserByID(snapshot.user_id);
        snapshot.stock = await getStockByID(snapshot.stock_id);
        return snapshot;
    }));
    dataState[`snapshots_${timeframe}`] = json;
    return json;
}

export async function getUsers(): Promise<User[]> {
    const res = await cachedRequest('/users');
    if (res.status != 200) return [];
    const json = await res.json();
    dataState.users = json;
    return json;
}


