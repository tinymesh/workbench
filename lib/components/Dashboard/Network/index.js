import React from 'react'

import {Link} from 'react-router'
import {Row, Glyphicon} from 'react-bootstrap'

import {Overview} from './Overview.jsx'
import {Devices} from './Devices'
import {ACL} from './ACL.jsx'
import {NotFound} from '../../NotFound.jsx'

import {NetworkStore, NetworkService} from '../../../stores/Network'
import {DeviceService} from '../../../stores'
import {SetupGuide} from '../SetupGuide.jsx'

import {Stream} from '../../../Stream.jsx'
import {Query} from './../Query.jsx'

export class Network extends React.Component {
  constructor() {
    super()

    this._mounted = false
    this.state = {
      network: null,
      stream: null
    }

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.nid !== this.props.params.nid)
      this.setState({network: NetworkStore.network(nextProps.params.nid)})
  }

  // ensure network is fetched
  componentWillUpdate(nextProps, nextState) {
    if (!nextState.network)
      NetworkService.fetch(nextProps.params.nid)

    if (this.props.params.nid !== nextProps.params.nid) {
      if (this.state.stream)
        this.state.stream.close()

      let nid = nextProps.params.nid
      this.setState({stream: this.stream(nid)})
    }
  }

  componentWillMount() {
    let nid = this.props.params.nid
    this._mounted = true

    NetworkStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({network: NetworkStore.network(nid)})
    })

    if (!NetworkStore.network(nid)) {
      NetworkService.fetch(this.props.params.nid)
    } else {
      this.setState({network: NetworkStore.network(nid)})
    }

    this.setState({stream: this.stream(nid)})
  }

  componentWillUnmount() {
    this._mounted = false

    NetworkStore.removeChangeListener(this._changeListener)

    if (this.state.stream)
      this.state.stream.close()
  }

  stream(nid, opts) {
    let query = "network/" + nid + ";device/" + nid + "/*;stream/" + nid

    if (this.state.stream)
      this.state.stream.close()

    let stream = new Stream(query)
    stream.on("network", this.onNetwork)
    stream.on("stream", this.onStream)
    stream.on("device", this.onDevice)
  }

  onNetwork(network) {
    NetworkService.fetch(network._id)
  }

  onStream(ev) {
  }

  onDevice(device) {
    if (!device.network && !device.key && !device._id)
      return

    let
      nid = device.network,
      key = device.key

    if (!device.network && !device.key && device._id) {
      let parts  = device._id.split('/')
      nid = parts[0]
      key = parts[1]
    }

    DeviceService.fetch(nid, key)
  }


  render() {
    let
      preRoutes = _.dropRightWhile(this.props.routes, (route) => Network !== route.component),
      basepath = _.trim( _.map(preRoutes, (route) => route.path).join('/'), '/'),
      mapRoute = (path) => {
        let params = this.props.params
        path = _.isArray(path) ? path.join('/') : path
        return '/' + (basepath + '/' + _.trim(path, '/'))
                .replace(/\/:([a-zA-Z0-9_-]*)/g, (match, k) => '/' + params[k])
      }

    let needSetup = _.size(this.state.network.devices) === 0 || _.size(this.state.network.channels) === 0

    return (
      <div>
        <Row>
          <ul className="navigation bare">
            {this.props.route.childRoutes.map( (route, k) => {
              let active = route.path === this.props.route.path

              return route.linkText
                ? <li key={k} className={active ? "active" : null}>
                    <Link
                      activeClassName="active"
                      to={mapRoute(route.path)}
                      style={{padding: '20px 25px'}}>

                      {route.glyph && <Glyphicon glyph={route.glyph}>&nbsp;</Glyphicon>}
                      {route.linkText}
                    </Link>
                  </li>
                : null
              })}
          </ul>
        </Row>

        {needSetup
          ? <SetupGuide {...this.props} network={this.state.network} />
          : (this.props.children
              ?  React.cloneElement(this.props.children, {network: this.state.network})
              : <Overview {...this.props} network={this.state.network} />)}
      </div>
    )
  }
}

Network.childRoutes = [
  {
    path: '/',
    component: Devices,
    childRoutes: Overview.childRoutes,
    linkText: "Overview",
    glyph: "th-list",
  },
  {
    path: 'device',
    component: Devices,
    childRoutes: Devices.childRoutes,
    linkText: "Devices",
    glyph: "hdd",
  },
  {
    path: 'query',
    linkText: 'Query',
    component: Query,
    childRoutes: Query.childRoutes,
    glyph: "zoom-in",
  },
//  {
//    path: 'acl',
//    component: ACL,
//    childRoutes: ACL.childRoutes,
//    linkText: "Access Control",
//    glyph: "lock",
//  },
  {
    path: '*',
    component: NotFound
  }
]
