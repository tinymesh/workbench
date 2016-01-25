import axios from 'axios'

import {AuthStore} from '../../Auth'

import Actions from './Actions'
import {DEVICE_URL} from './Constants'

class DeviceService {
  create(nid, data) {
    let
      payload = JSON.stringify(data),
      url = DEVICE_URL + '/' + nid,
      headers = {
        'Authorization':  AuthStore.signV1('POST', url, payload),
        'Content-Type':  'text/json'
      }

    return axios.post(url, payload, {headers})
      .then(
        (resp) => {
          Actions.create(nid, resp.data.key, resp.data)
          return resp
        })
  }

  update(nid, key, patch) {
    let
      payload = JSON.stringify(patch),
      url = DEVICE_URL + '/' + nid + '/' + key,
      headers = {
        'Authorization':  AuthStore.signV1('PUT', url, payload),
        'Content-Type':  'text/json'
      }

    return axios.put(url, payload, {headers})
      .then(
        (response) => Actions.update(nid, key, response.data))
  }

  list(nid) {
    let
      url = DEVICE_URL + '/' + nid,
      headers = { 'Authorization':  AuthStore.signV1('GET', url, '') }

    return axios.get(url, {headers})
      .then(
        (response) => Actions.list(nid, response.data))
  }

  fetch(nid, key) {
    let
      url = DEVICE_URL + '/' + nid + '/' + key,
      headers = { 'Authorization':  AuthStore.signV1('GET', url, ''), }

    return axios.get(url, {headers})
      .then(
        (response) => Actions.change(nid, key, response.data))
  }
}


export default new DeviceService()
