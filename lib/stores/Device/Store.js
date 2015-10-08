import _ from 'lodash'

import BaseStore from '../Base'
import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

class DeviceStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))

    this._devices = []
  }

  _subscribe(action) {
    let idx
    switch (action.actionType) {
      case Actions.create:
        this._devices.push(action.device)
        this.emitChange()
        break

      case Actions.change:
        idx = _.findIndex(this._devices, {key: action.key, network: action.nid})
        if (-1 === idx)
          return

        this._device[idx] = action.device
        this.emitChange()
        break

      case Actions.update:
        idx = _.findIndex(this._devices, {key: key, network: nid})
        if (-1 === idx)
          return

        this._devices[idx] = _.merge(this._devices[idx], action.device)
        this.emitChange()
        break

      case Actions.list:
        this._devices = _.uniq(
          action.devices.concat(this._devices),
          (dev) => dev.network + '/' + dev.key)
        this.emitChange()
        break

      default:
        break
    }
  }

  devices(nid) {
    return _.where(this._devices, {network: nid})
  }

  device(nid, key) {
    return _.where(this._networks, {network: nid, key: key})[0]
  }
}

export default new DeviceStore()
