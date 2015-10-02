import {BASE_URL} from '../Constants'

export default {
  AUTH_URL: BASE_URL + '/auth/session',
  Actions: {
    login: 'user:login',
    logout: 'user:logout'
  },
  LogoutReasons: {
    sessionExpire: 'expire',
    user: 'user',
  }
}
