import {BASE_URL} from '../Constants'

export default {
  AUTH_URL: BASE_URL + '/auth/session',
  GET_SESS_URL: BASE_URL + '/auth',
  Actions: {
    login: 'user:login',
    logout: 'user:logout'
  },
  LogoutReasons: {
    sessionExpire: 'expire',
    user: 'user',
  }
}
