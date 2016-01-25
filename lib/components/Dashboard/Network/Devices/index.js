import React from 'react'

import {Row, Col, Table} from 'react-bootstrap'

import {CreateDevice} from './CreateDevice.jsx'
import {DeviceList} from './DeviceList.jsx'
import {Device} from './Device.jsx'
import {NotFound} from '../../../NotFound.jsx'

export class Devices extends React.Component {
  constructor() {
    super()
  }

  render() {
    return this.props.children ? this.props.children : <DeviceList {...this.props}  />
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
