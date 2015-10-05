import axios from 'axios'

import Actions from './Actions'
import AuthStore from './Store'
import {AUTH_URL, GET_SESS_URL} from './Constants'

class AuthService {
  login(email, password) {
    return axios.post(AUTH_URL, {email, password})
      .then(
        (response) => Actions.login(response.data))
  }

  logout(reason) {
    let headers = {'Authorization':  AuthStore.signV1('DELETE', AUTH_URL, '')}

    return axios.delete(AUTH_URL, {headers})
      .then(
        (response) => Actions.logout(reason) )
      .catch(
        (err) => {
          if (401 === err.status)
            Actions.logout()
      })
  }

  validate(auth) {
    let headers = {'Authorization':  AuthStore.signV1('GET', GET_SESS_URL, '', auth)}

    return axios.get(GET_SESS_URL, {headers})
      .then(
        (response) => Actions.login(auth))
      .catch(
        (response) => Actions.logout('remote'))

  }

  register(email, password) {
  }
}


export default new AuthService()
