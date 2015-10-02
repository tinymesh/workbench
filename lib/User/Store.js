import BaseStore from '../stores/Base'
import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'
import {AuthActions} from '../Auth'

class UserStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))
    this._user = null
    this._stage = null // future changes to user

    //if (localStorage['/user'])
    //  try {
    //    this._user = JSON.parse(localStorage['/user'])
    //  } catch(e) {
    //    localStorage.removeItem('/user')
    //  }
  }

  _subscribe(action) {
    switch (action.actionType) {
      case Actions.update:
        this._stage = action.user
        break

      case Actions.change:
        this._user = action.user
        this._stage = null
        this.emitChange()
        break

      case AuthActions.logout:
        this._user = null
        this._stage = null
        this.emitChange()
        break

      default:
        break
    }
  }

  get user() {
    return this._user
  }

  get staged_user() {
    return this._stage
  }
}

export default new UserStore()

