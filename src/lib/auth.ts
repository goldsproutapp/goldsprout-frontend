import router from '@/router'
import { emptyUser } from './data'
import { authState } from './state'

export function logIn(data: any) {
  authState.loggedIn = true
  authState.token = data.token
  authState.userInfo = data.data
  saveAuthState()
  router.push('/')
}

export function saveAuthState() {
  window.localStorage.setItem('userinfo', JSON.stringify(authState.userInfo))
  window.localStorage.setItem('token', authState.token)
}

export function logOut(require_login: boolean = false) {
  window.localStorage.removeItem('userinfo')
  window.localStorage.removeItem('token')
  authState.loggedIn = false
  authState.token = ''
  authState.userInfo = emptyUser()
  if (require_login) {
    router.push('/login')
  }
}

export function validatePassword(password: string): [boolean, string] {
  if (password.length < 8) return [false, 'Password must be at least 8 characters long']
  if (!password.match(/[0-9]/)) return [false, 'Password must contain at least 1 number']

  if (!password.match(/[\W_]/)) return [false, 'Password must contain at least 1 special character']
  return [true, '']
}
