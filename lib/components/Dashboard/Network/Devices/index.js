import React from 'react'

import {DeviceList} from './DeviceList.jsx'
import {Device} from './Device.jsx'
import {NotFound} from '../../../NotFound.jsx'

export class Devices extends React.Component {
  render() {
    return (
      <div>
        <h1>Devices</h1>
      </div>
    )
  }
}

Devices.childRoutes = [
  {
    path: '/',
    component: DeviceList,
    childRoutes: DeviceList.childRoutes
  },
  {
    path: ':device',
    component: Device,
    childRoutes: Device.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
