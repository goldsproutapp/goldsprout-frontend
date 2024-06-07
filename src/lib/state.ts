import { reactive } from 'vue'
import { emptyUser } from './data'
import { type User, type Provider, type Stock, type Snapshot } from './types'

export const authState = reactive<{
  loggedIn: boolean
  token: string
  userInfo: User
}>({
  loggedIn: false,
  token: '',
  userInfo: emptyUser()
})

export const dataState = reactive({
  stocks: new Array<Stock>(),
  providers: new Array<Provider>(),
  snapshots_latest: new Array<Snapshot>(),
  snapshots_all: new Array<Snapshot>(),
  users: new Array<User>(),
  regions: new Array<string>(),
  sectors: new Array<string>(),
  userHoldings: {} as { [key: string]: { [key: string]: string } },
  stockHoldings: {} as { [key: string]: { [key: string]: string } }
})

export function updateAuthState() {
  const token = window.localStorage.getItem('token')
  const userInfo = JSON.parse(window.localStorage.getItem('userinfo') || '{}')
  authState.token = token || ''
  authState.loggedIn = token !== null
  authState.userInfo = userInfo
}
