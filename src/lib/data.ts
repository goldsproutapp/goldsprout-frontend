import { getAccounts, getProviderList, getStockList, getUsers } from './requests';
import { dataState } from './state';
import { type User, type Stock, type Provider, type Account, type Snapshot } from './types';
import type { SnapshotTableInfo } from '@/lib/derived_types';

export async function getStockByID(id: number, request_if_none: boolean = true): Promise<Stock> {
  const stock = dataState.stocks.find((stock) => stock.id === id);
  if (stock === undefined && request_if_none) {
    await getStockList(false);
    return getStockByID(id, false);
  }
  return stock as Stock;
}

export function getCachedUser(id: number): User | undefined {
  return dataState.users.find((user) => user.id === id);
}

export async function getUserByID(id: number, request_if_none: boolean = true): Promise<User> {
  const user = getCachedUser(id);
  if (user === undefined && request_if_none) {
    await getUsers(false);
    return getUserByID(id, false);
  }
  return user as User;
}

export async function getUserByName(name: string, request_if_none: boolean = true): Promise<User> {
  const user = dataState.users.find((user) => getUserDisplayName(user) === name);
  if (user === undefined && request_if_none) {
    await getUsers(false);
    return await getUserByName(name, false);
  }
  return user as User;
}

export async function getProviderByID(
  id: number,
  request_if_none: boolean = true
): Promise<Provider> {
  const provider = dataState.providers.find((provider) => provider.id === id);
  if (provider === undefined && request_if_none) {
    await getProviderList(false);
    return getProviderByID(id, false);
  }
  return provider as Provider;
}

export async function getProviderByName(
  name: string,
  request_if_none: boolean = true
): Promise<Provider> {
  const provider = dataState.providers.find((provider) => provider.name === name);
  if (provider === undefined && request_if_none) {
    await getProviderList(false);
    return getProviderByName(name, false);
  }
  return provider as Provider;
}

export async function getAccountByID(
  id: number,
  request_if_none: boolean = true
): Promise<Account> {
  const account = dataState.accounts.find((account) => account.id === id);
  if (account === undefined && request_if_none) {
    await getAccounts(false);
    return getAccountByID(id, false);
  }
  return account as Account;
}

export async function getAccountByName(
  name: string,
  user_id: number,
  provider_id: number,
  request_if_none: boolean = true
): Promise<Account> {
  const account = dataState.accounts.find(
    (account: Account) =>
      account.name == name && account.user_id == user_id && account.provider_id == provider_id
  );
  if (account === undefined && request_if_none) {
    await getAccounts(false);
    return getAccountByName(name, user_id, provider_id, false);
  }
  return account as Account;
}

export async function stocks() {
  if (dataState.stocks.length == 0) await getStockList(false);
  return dataState.stocks;
}

export async function providers() {
  if (dataState.providers.length == 0) await getProviderList(false);
  return dataState.providers;
}

export async function users() {
  if (dataState.users.length == 0) await getUsers(false);
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
  return `${num} ${str}${num === 1 ? '' : 's'}`;
}
export function formatDecimal(num: string): string {
  const parts = num.split('.');
  let output = '';
  for (let i = 0; i < parts[0].length; i++) {
    const char = parts[0][parts[0].length - i - 1];
    const nextChar = parts[0][parts[0].length - i - 2];
    output = char + output;
    if (i >= 2 && (i + 1) % 3 === 0 && i + 1 != parts[0].length && nextChar != '-')
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
    is_demo_user: false,
    trusted: false,
    access_permissions: []
  };
}

export function snapshotTableInfo(snapshot: Snapshot): SnapshotTableInfo {
  return {
    ...snapshot,
    stock_name: snapshot.stock?.name,
    date_string: snapshot.date.toLocaleDateString(),
    user_name: getUserDisplayName(snapshot.user),
    account_name: snapshot.account?.name
  };
}

export async function processSnapshotReponse(snapshots: Array<Object>) {
  return await Promise.all(
    snapshots.map(async (snapshot: any) => {
      snapshot.date = new Date(snapshot.date);
      snapshot.user = await getUserByID(snapshot.user_id);
      snapshot.stock = await getStockByID(snapshot.stock_id);
      snapshot.account = await getAccountByID(snapshot.account_id);
      return snapshot;
    })
  );
}
