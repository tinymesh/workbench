import React from 'react'

import {Row, Col, Table} from 'react-bootstrap'

import {NotFound} from '../../NotFound.jsx'
import {Overview} from './Overview.jsx'

import {DeviceService, DeviceStore} from '../../../stores'
import {NetworkService, NetworkStore} from '../../../stores'

export class Device extends React.Component {
  constructor() {
    super()

    this._mounted = false

    this.state = {
      device: null,
      network: null,
    }
  }


  componentWillMount() {
    let
      nid = this.props.params.nid,
      key = this.props.params.key

    DeviceStore.addChangeListener( this._deviceChangeListener = () => {
      if (this._mounted)
        this.setState({device: DeviceStore.device(nid, key)})
    })

    NetworkStore.addChangeListener( this._networkChangeListener = () => {
      if (this._mounted)
        this.setState({network: NetworkStore.network(nid)})
    })

    let device;
    if (! (device  = DeviceStore.device(nid, key)))
      DeviceService.fetch(nid, key)
    else
      this.setState({device: device})

    let network;
    if (! (network = NetworkStore.network(nid)))
      NetworkService.fetch(nid)
    else
      this.setState({network: network})
  }

  componentDidMount() {
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false

    DeviceStore.removeChangeListener(this._deviceChangeListener)
    NetworkStore.removeChangeListener(this._networkChangeListener)
  }

  componentWillReceiveProps(nextProps) {
  }

  // ensure network is fetched
  componentWillUpdate(nextProps, nextState) {
    if (!nextState.device)
      DeviceService.fetch(nextProps.params.nid)
  }

  render() {
    return this.props.children
      ?  React.cloneElement(this.props.children, {device: this.state.device, network: this.props.network})
      : <Overview network={this.state.network} device={this.state.device} {...this.props} />
  }
}

Device.childRoutes = [
  {
    path: '/',
    component: Overview,
    childRoutes: Overview.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
