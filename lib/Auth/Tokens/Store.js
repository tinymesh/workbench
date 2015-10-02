import BaseStore from '../../stores/Base'
import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

import _ from 'lodash'

class TokenStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))
    this._tokens = null
    this._sessions = null
  }

  _subscribe(action) {
    switch (action.actionType) {
      case Actions.create:
        switch (action.token.type) {
          case 'session':
            this._sessions.push(action.token)
            break
          case 'token':
            this._tokens.push(action.token)
            break
        }

        this.emitChange()
        break

      case Actions.revoke:
        var idx = _.findIndex(this._sessions, (e) => e.fingerprint === action.fingerprint)
        if (-1 !== idx) {
          this._sessions[idx].revoked = {at: new Date().toISOString(), reasons: action.reason}
          this.emitChange()
        } else if (-1 !== (idx = _.findIndex(this._tokens, (e) => e.fingerprint === action.fingerprint))) {
          this._tokens[idx].revoked = {at: new Date().toISOString(), reasons: action.reason}
          this.emitChange()
        }
        break

      case Actions.fetch_tokens:
        this._tokens = action.tokens
        this.emitChange()
        break

      case Actions.fetch_sessions:
        this._sessions = action.sessions
        this.emitChange()
        break

      default:
        break
    }
  }

  get tokens() {
    return this._tokens
  }

  get sessions() {
    return this._sessions
  }
}

export default new TokenStore()
