import {getProviderList, getStockList, getUsers} from "./requests";
import {dataState} from "./state";
import {type User, type Stock, type Provider} from "./types";


export async function getStockByID(id: number, request_if_none: boolean = true): Promise<Stock> {
    const stock = dataState.stocks.find(stock => stock.id === id);
    if (stock === undefined && request_if_none) {
        await getStockList();
        return getStockByID(id, false);
    }
    return stock as Stock;
}

export async function getUserByID(id: number, request_if_none: boolean = true): Promise<User> {
    const user = dataState.users.find(user => user.id === id);
    if (user === undefined && request_if_none) {
        await getUsers();
        return getUserByID(id, false);
    }
    return user as User;
}

export async function getProviderByID(id: number, request_if_none: boolean = true): Promise<Provider> {
    const provider = dataState.providers.find(provider => provider.id === id);
    if (provider === undefined && request_if_none) {
        await getProviderList();
        return getProviderByID(id, false);
    }
    return provider as Provider;
}

export async function stocks() {
    if (dataState.stocks.length == 0) await getStockList();
    return dataState.stocks;
}

export async function providers() {
    if (dataState.providers.length == 0) await getProviderList();
    return dataState.providers;
}

export function deepPath(obj: any, path: string[]): any {
    let head = obj;
    for (const subPath of path) head = head[subPath];
    return head;
}
export function mean(array: number[]) {
    if (array.length == 0) return 0;
    return array.reduce((acc, num) => acc + num, 0) / array.length;
}
