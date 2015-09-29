import axios from 'axios'

import Actions from '../actions/Auth.jsx'
import {AUTH_URL} from '../constants/Auth.jsx'

class AuthService {
  login(email, password) {
    return axios.post(AUTH_URL, {email, password})
      .then(
        (response) => Actions.login(response.data))
  }

  logout() {
    return axios.delete(AUTH_URL)
      .then(
        (response) => Actions.logout(auth) )
  }

  register(email, password) {
  }

  haveAuthenticated() {
    return false
  }
}


export default new AuthService()
