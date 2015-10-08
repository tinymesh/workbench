import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

export default {
  create: (nid, key, data) => {
    AppDispatcher.dispatch({
      actionType: Actions.create,
      nid: nid,
      key: key,
      device: data
    })
  },

  update: (nid, key, patch) => {
    AppDispatcher.dispatch({
      actionType: Actions.update,
      nid: nid,
      key: key,
      device: patch
    })
  },

  list: (nid, devices) => {
    AppDispatcher.dispatch({
      actionType: Actions.list,
      nid: nid,
      devices: devices
    })
  },

  change: (nid, key, device) => {
    AppDispatcher.dispatch({
      actionType: Actions.change,
      nid: nid,
      key: key,
      device: device
    })
  }
}
