import React from 'react'

import {Link} from 'react-router'
import {Row, Glyphicon} from 'react-bootstrap'

import {Overview} from './Overview.jsx'
import {Devices} from './Devices'
import {ACL} from './ACL.jsx'
import {NotFound} from '../../NotFound.jsx'

import {NetworkStore, NetworkService} from '../../../Networks'

export class Network extends React.Component {
  constructor() {
    super()

    this._mounted = false
    this.state = {
      network: null
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
  }

  componentWillUnmount() {
    this._mounted = false

    NetworkStore.removeChangeListener(this._changeListener)
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
          ?  React.cloneElement(this.props.children, {network: this.state.network})
          : <Overview {...this.props} network={this.state.network} />}
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
    path: 'acl',
    component: ACL,
    childRoutes: ACL.childRoutes,
    linkText: "Access Control",
    glyph: "lock",
  },
  {
    path: '*',
    component: NotFound
  }
]
