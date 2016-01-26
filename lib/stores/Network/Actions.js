import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

export default {
  new: (network) => {
    AppDispatcher.dispatch({
      actionType: Actions.new,
      nid: network.nid,
      network: network
    })
  },

  update: (nid, patch) => {
    AppDispatcher.dispatch({
      actionType: Actions.update,
      nid: nid,
      network: patch
    })
  },

  list: (networks) => {
    AppDispatcher.dispatch({
      actionType: Actions.list,
      networks: networks
    })
  },

  change: (nid, network) => {
    AppDispatcher.dispatch({
      actionType: Actions.change,
      nid: nid,
      network: network
    })
  }
}
