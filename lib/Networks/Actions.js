import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

export default {
  new: (data) => {
    localStorage.setItem('/network/' + nid)

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
    localStorage.setItem('/network', networks)

    AppDispatcher.dispatch({
      actionType: Actions.list,
      networks: networks
    })
  },

  change: (nid, network) => {
    localStorage.setItem('/network/' + nid)

    AppDispatcher.dispatch({
      actionType: Actions.change,
      nid: nid,
      network: network
    })
  }
}
