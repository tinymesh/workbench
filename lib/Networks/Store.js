import _ from 'lodash'

import BaseStore from '../stores/Base'
import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

class NetworkStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))

    this._networks = []
  }

  _subscribe(action) {
    let idx
    switch (action.actionType) {
      case Actions.new:
      case Actions.change:
        idx = _.findIndex(this._networks, {key: action.nid})
        if (-1 === idx)
          return

        this._networks[idx] = action.network
        this.emitChange()
        break

      case Actions.update:
        idx = _.findIndex(this._networks, {key: action.nid})
        if (-1 === idx)
          return

        this._networks[idx] = _.merge(this._networks[idx], action.network)
        this.emitChange()
        break

      case Actions.list:
        this._networks = action.networks
        this.emitChange()
        break

      default:
        break
    }
  }

  get networks() {
    return this._networks;
  }

  network(nid) {
    return _.where(this._networks, {key: nid})[0]
  }
}

export default new NetworkStore()
