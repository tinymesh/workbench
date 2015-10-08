import {BASE_URL} from '../../Constants'

export default {
  DEVICE_URL: BASE_URL + '/device',
  Actions: {
    create: 'device:create',
    update: 'device:update',
    list:   'device:list',
    change: 'device:change'
  }
}
