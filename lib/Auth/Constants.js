var BASE_URL = 'https://http.cloud.tiny-mesh.com/v1';

export default {
  BASE_URL: BASE_URL,
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
