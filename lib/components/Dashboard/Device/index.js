import React from 'react'

import {Link} from 'react-router'
import {Row, Col, Glyphicon} from 'react-bootstrap'

import {NotFound} from '../../NotFound.jsx'
import {Overview} from './Overview.jsx'
import {Config} from './Config.jsx'
import {Query} from './../Query.jsx'
import {SerialConsole} from './SerialConsole.jsx'
import {SendMsg} from '../SendMsg.jsx'

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
    let
      preRoutes = _.dropRightWhile(this.props.routes, (route) => Device !== route.component),
      basepath = _.trim( _.map(preRoutes, (route) => route.path).join('/'), '/'),
      mapRoute = (path) => {
        let params = this.props.params
        path = _.isArray(path) ? path.join('/') : path
        return '/' + (basepath + '/' + _.trim(path, '/'))
                .replace(/\/:([a-zA-Z0-9_-]*)/g, (match, k) => '/' + params[k])
      }

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

        {this.props.children
          ?  React.cloneElement(this.props.children, {device: this.state.device, network: this.props.network})
          : <Overview network={this.state.network} device={this.state.device} {...this.props} />}

      </div>
    )
  }
}

Device.sidebar = false

Device.childRoutes = [
  {
    path: '/',
    linkText: 'Overview',
    component: Overview,
    childRoutes: Overview.childRoutes,
    glyph: "th-list",
  },
  {
    path: 'config',
    linkText: 'Configuration',
    component: Config,
    childRoutes: Config.childRoutes,
    glyph: "cog",
  },
  {
    path: 'query',
    linkText: 'Query',
    component: Query,
    childRoutes: Query.childRoutes,
    glyph: "zoom-in",
  },
  {
    path: 'console',
    linkText: 'Serial Console',
    component: SerialConsole,
    childRoutes: SerialConsole.childRoutes,
    glyph: "console",
  },
  {
    path: 'packets',
    component: SendMsg,
    childRoutes: SendMsg.childRoutes,
    linkText: "Send Data",
    glyph: "file",
  },
  {
    path: '*',
    component: NotFound
  }
]
