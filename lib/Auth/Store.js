import BaseStore from '../stores/Base'
import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

import sjcl from 'sjcl'

class AuthStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))
    this._auth          = null
    this._authenticated = null
  }

  _subscribe(action) {
    switch (action.actionType) {
      case Actions.login:
        this._auth = action.auth
        this._authenticated = true
        this.emitChange()
        break

      case Actions.logout:
        this._auth = null
        this._authenticated = false
        this.emitChange()
        break

      default:
        break
    }
  }

  get auth() {
    return this._auth;
  }

  haveAuthentication() {
    return !!this._auth
  }

  get isAuthenticated() {
    // null := have authentication but no response from server yet
    return this._authenticated
  }

  signV1(method, url, body, auth) {
    auth = auth || this._auth

    if (!auth)
      return;

    let
      hmac = new sjcl.misc.hmac(sjcl.codec.utf8String.toBits(auth.key)),
      digest = hmac.mac([method || '', url || '', body || ''].join("\n"))

    return auth.fingerprint + " " + sjcl.codec.base64.fromBits(digest)
  }
}

export default new AuthStore()
