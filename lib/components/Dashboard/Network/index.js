import React from 'react'

import {Link} from 'react-router'
import {Row, Glyphicon} from 'react-bootstrap'

import {Overview} from './Overview.jsx'
import {Devices} from './Devices'
import {ACL} from './ACL.jsx'
import {NotFound} from '../../NotFound.jsx'

export class Network extends React.Component {
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

        {this.props.children || <Overview {...this.props.children} />}
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
