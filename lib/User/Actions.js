import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

export default {
  update: (user) => {
    AppDispatcher.dispatch({
      actionType: Actions.update,
      user: user
    })
  },

  change: (user) => {
    AppDispatcher.dispatch({
      actionType: Actions.change,
      user: user
    })
  }
}

