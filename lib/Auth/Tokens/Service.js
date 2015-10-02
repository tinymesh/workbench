import axios from 'axios'

import Actions from './Actions'
import {AuthStore} from '../index'
import {TOKEN_URL, SESSION_URL} from './Constants'

class TokenService {
  create(data) {
    let
      buf = JSON.stringify(data),
      headers = {
        'Authorization':  AuthStore.signV1('POST', TOKEN_URL, buf),
        'Content-Type': 'application/json'
      }

    return axios.post(TOKEN_URL, buf, {headers})
      .then( (response) => {
        Actions.create(response.data)
        return response.data
      })
  }

  revoke(fingerprint, reason) {
    let
      url = TOKEN_URL + '/revoke/' + fingerprint,
      buf = JSON.stringify({reason}),
      headers = {
        'Authorization':  AuthStore.signV1('POST', url, buf),
        'Content-Type': 'application/json'
      }

    return axios.post(url, buf, {headers})
      .then(
        (response) => Actions.revoke(fingerprint, reason) )
  }

  fetchSessions() {
    let
      url = SESSION_URL,
      headers = {'Authorization':  AuthStore.signV1('GET', url, '')}

    return axios.get(url, {headers})
      .then( (response) => Actions.fetchSessions(response.data) )
  }

  fetchTokens() {
    let
      url = TOKEN_URL,
      headers = {'Authorization':  AuthStore.signV1('GET', url, '')}

    return axios.get(url, {headers})
      .then( (response) => Actions.fetchTokens(response.data) )
  }
}


export default new TokenService()
