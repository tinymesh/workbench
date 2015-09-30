import BaseStore from '../stores/Base'
import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

class AuthStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))
    this._auth = null
  }

  _subscribe(action) {
    switch (action.actionType) {
      case Actions.login:
        this._auth = action.auth
        this.emitChange()
        break

      case Actions.logout:
        this._auth = null
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
}

export default new AuthStore()
