import axios from 'axios'

import {AuthStore} from '../Auth'

import Actions from './Actions'
import {NETWORK_URL} from './Constants'

class NetworkService {
  create(data) {
    let
      payload = JSON.stringify(data),
      headers = {
        'Authorization':  AuthStore.signV1('POST', NETWORK_URL, payload),
        'Content-Type':  'text/json'
      }

    return axios.post(NETWORK_URL, payload, {headers})
      .then(
        (response) => {Actions.new(response.data); return response.data})
  }

  update(nid, data) {
    let
      payload = JSON.stringify(data),
      url = NETWORK_URL + '/' + nid,
      headers = {
        'Authorization':  AuthStore.signV1('PUT', url, payload),
        'Content-Type':  'text/json'
      }

    return axios.put(url, payload, {headers})
      .then(
        (response) => Actions.update(nid, response.data))
  }

  list() {
    let headers = { 'Authorization':  AuthStore.signV1('GET', NETWORK_URL, ''), }

    return axios.get(NETWORK_URL, {headers})
      .then(
        (response) => Actions.list(response.data))
  }

  fetch(nid) {
    let
      url = NETWORK_URL + '/' + nid,
      headers = { 'Authorization':  AuthStore.signV1('GET', url, ''), }

    return axios.get(url, {headers})
      .then(
        (response) => Actions.change(nid, response.data))
  }
}


export default new NetworkService()
