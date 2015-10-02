import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

export default {
  create: (token) => {
    AppDispatcher.dispatch({
      actionType: Actions.create,
      token: token
    })
  },

  revoke: (fingerprint, reason) => {
    AppDispatcher.dispatch({
      actionType: Actions.revoke,
      fingerprint: fingerprint,
      reason: reason
    })
  },

  fetchTokens: (tokens) => {
    AppDispatcher.dispatch({
      actionType: Actions.fetch_tokens,
      tokens: tokens
    })
  },

  fetchSessions: (sessions) => {
    AppDispatcher.dispatch({
      actionType: Actions.fetch_sessions,
      sessions: sessions
    })
  }
}
