import BaseStore from './Base.jsx'
import AppDispatcher from '../dispatchers/App.jsx'
import {Actions} from '../constants/Auth.jsx'

class LoginStore extends BaseStore {

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

export default new LoginStore()
