import axios from 'axios'

import Actions from './Actions'
import {USER_URL} from './Constants'

import {AuthStore, AuthActions, AuthConstants} from '../Auth'

class UserService {
  update(userPatch) {
    let payload = JSON.stringify(userPatch)
    let headers = {
      'Authorization':  AuthStore.signV1('PUT', USER_URL, payload),
      'Content-Type': 'text/json'
    }

    Actions.update(userPatch)
    return axios.put(USER_URL, payload, {headers})
      .then(
        (response) => Actions.change(response.data))
      .catch(
        (response) => {
          //if (response.status === 401)
          //  AuthActions.logout(AuthConstants.LogoutReasons.sessionexpire)

          throw response
        })
  }

  fetch() {
    let headers = {'Authorization':  AuthStore.signV1('GET', USER_URL, '')}

    return axios.get(USER_URL, {headers})
      .then(
        (response) => Actions.change(response.data))
      .catch(
        (response) => {
          if (response.status === 401)
            AuthActions.logout('timeout')

          throw response
        })
  }
}


export default new UserService()
