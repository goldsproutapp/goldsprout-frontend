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

export async function getUserByName(name: string, request_if_none: boolean = true): Promise<User> {
    const user = dataState.users.find(user => getUserDisplayName(user) === name);
    if (user === undefined && request_if_none) {
        await getUsers();
        return await getUserByName(name, false);
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

export async function getProviderByName(name: string, request_if_none: boolean = true): Promise<Provider> {
    const provider = dataState.providers.find(provider => provider.name === name);
    if (provider === undefined && request_if_none) {
        await getProviderList();
        return getProviderByName(name, false);
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

export async function users() {
    if (dataState.users.length == 0) await getUsers();
    return dataState.users;
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

export function getUserDisplayName(user: User): string {
    return `${user.first_name} ${user.last_name}`;
}

export function pluralise(num: number, str: string): string {
    return `${num} ${str}${num === 1 ? '' : 's'}`
}
export function formatDecimal(num: string): string {
    const parts = num.split('.');
    let output = '';
    for (let i = 0; i < parts[0].length; i++) {
        output = parts[0][parts[0].length - i - 1] + output;
        if (i >= 2 && (i + 1) % 3 === 0 && (i+1) != parts[0].length)
            output = ',' + output;
    }
    parts[0] = output;
    return parts.join('.');
}

export function emptyUser(): User {
    return {
        id: 0,
        active: false,
        client_options: '',
        created_at: new Date(),
        email: '',
        first_name: '',
        last_name: '',
        is_admin: false,
        trusted: false,
        access_permissions: [],
    }
}
