import { reactive } from 'vue';
import { emptyUser } from './data';
import { type User, type Provider, type Stock, type Snapshot, type Account } from './types';

export const authState = reactive<{
  loggedIn: boolean;
  token: string;
  userInfo: User;
}>({
  loggedIn: false,
  token: '',
  userInfo: emptyUser()
});

interface HoldingInfo {
  units: string;
  value: string;
}
type HoldingMap = { [key: string]: { [key: string]: HoldingInfo } };

export const dataState = reactive({
  stocks: new Array<Stock>(),
  providers: new Array<Provider>(),
  accounts: new Array<Account>(),
  snapshots_latest: new Array<Snapshot>(),
  snapshots_by_stock: {} as { [key: string]: Snapshot[] },
  users: new Array<User>(),
  regions: new Array<string>(),
  sectors: new Array<string>(),
  userHoldings: {} as HoldingMap,
  stockHoldings: {} as HoldingMap,
  accountHoldings: {} as HoldingMap
});

export function updateAuthState() {
  const token = window.localStorage.getItem('token');
  const userInfo = JSON.parse(window.localStorage.getItem('userinfo') || '{}');
  authState.token = token || '';
  authState.loggedIn = token !== null;
  authState.userInfo = userInfo;
}
