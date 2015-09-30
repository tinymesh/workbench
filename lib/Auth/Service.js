import axios from 'axios'

import Actions from './Actions'
import {AUTH_URL} from './Constants'

class AuthService {
  login(email, password) {
    return axios.post(AUTH_URL, {email, password})
      .then(
        (response) => Actions.login(response.data))
  }

  logout() {
    return axios.delete(AUTH_URL)
      .then(
        (response) => Actions.logout() )
      .catch(
        (err) => {
          if (401 === err.status)
            Actions.logout()
      })
  }

  register(email, password) {
  }
}


export default new AuthService()
