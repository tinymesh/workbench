import {BASE_URL} from '../../Constants'

export default {
  TOKEN_URL: BASE_URL + '/auth/token',
  SESSION_URL: BASE_URL + '/auth/session',
  Actions: {
    create: 'auth:token:create',
    revoke: 'auth:token:revoke',
    fetch_sessions: 'auth:token:sessions',
    fetch_tokens: 'auth:token:tokens'
  },
}
