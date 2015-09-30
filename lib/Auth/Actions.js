import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

export default {
  login: (auth) => {
    localStorage.setItem('auth', JSON.stringify(auth))

    AppDispatcher.dispatch({
      actionType: Actions.login,
      auth: auth
    })
  },

  logout: (reason) => {
    localStorage.removeItem('auth')

    AppDispatcher.dispatch({
      actionType: Actions.logout,
      reason: reason
    })
  },
}
