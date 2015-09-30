import AppDispatcher from '../AppDispatcher'
import RouterService from '../services/Router'
import {Actions} from './Constants'

export default {
  login: (auth) => {
    localStorage.setItem('auth', JSON.stringify(auth))

    AppDispatcher.dispatch({
      actionType: Actions.login,
      auth: auth
    })
  },

  logout: () => {
    localStorage.removeItem('auth')

    AppDispatcher.dispatch({
      actionType: Actions.logout
    })
  },

  sign: (buf)  => {throw new Error("implement the fuck out of me")}
}
