import AppDispatcher from '../dispatchers/App.jsx'
import RouterService from '../services/Router.jsx'
import {Actions} from '../constants/Auth.jsx'

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
