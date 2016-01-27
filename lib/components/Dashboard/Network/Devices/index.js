import React from 'react'

import {Row, Col, Table} from 'react-bootstrap'

import {CreateDevice} from './CreateDevice.jsx'
import {DeviceList} from './DeviceList.jsx'
import {NotFound} from '../../../NotFound.jsx'

import {DeviceService, DeviceStore} from '../../../../stores'

export class Devices extends React.Component {
  constructor() {
    super()

    this.state = {
      device: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.nid !== this.props.params.nid ||
        nextProps.params.device !== this.props.params.device)

      this.setState({device: DeviceStore.device(nextProps.params.nid, nextProps.params.device)})
  }

  componentWillUpdate(nextProps, nextState) {
    if (!nextState.device
        && nextProps.params.device
        && !DeviceStore.device(nextProps.params.nid, nextProps.params.device))

      DeviceService.fetch(nextProps.params.nid, nextProps.params.device)
  }

  componentWillMount() {
    let
      nid = this.props.params.nid,
      dev = this.props.params.device

    this._mounted = true

    DeviceStore.addChangeListener( this._changeListener = () => {
      nid = this.props.params.nid
      dev = this.props.params.device

      if (this._mounted)
        this.setState({device: DeviceStore.device(nid, dev)})
    })

    let device = DeviceStore.device(nid, dev)

    if (dev && device)
      this.setState({device: DeviceStore.device(nid, dev)})
    else if(dev)
      DeviceService.fetch(nid, dev)
  }

  componentWillUnmount() {
    this._mounted = false

    DeviceStore.removeChangeListener(this._changeListener)
  }

  render() {
    return this.props.children
      ?  React.cloneElement(this.props.children, {device: this.state.device, network: this.props.network})
      : <DeviceList {...this.props}  />
  }
}

Devices.childRoutes = [
  {
    path: '/',
    component: DeviceList,
    childRoutes: DeviceList.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
