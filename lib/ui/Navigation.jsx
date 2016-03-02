import React from 'react'
import {Link} from 'react-router'
import {Glyphicon} from 'react-bootstrap'
import {Router} from 'react-router'

import {AuthService, AuthConstants} from '../Auth'

import _ from 'lodash'

export class Navigation extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }

  }

  toggleMenu() {
    this.setState({expanded: !this.state.expanded})
  }

  render() {
    let
      rootRoute = this.props.routes[1],
      expanded = this.state.expanded,
      mapRoute = (path) => {
        let params = this.props.params
        path = _.isArray(path) ? path.join('/') : path
        return ('/' + _.trim(path, '/'))
                .replace(/\/:([a-zA-Z0-9_-]*)/g, (match, k) => '/' + params[k])
      }

    return (
    <div>
      <ul className={"navigation " + (this.state.expanded ? 'expanded' : 'unexpanded')}>
        <li className="prefix">
          <a onClick={this.toggleMenu.bind(this)} title="Expand">
            <Glyphicon glyph={this.state.expanded ? "minus" : "plus"} />
          </a>
        </li>
        {this.props.routes[0].childRoutes.map( (route, k) => {
          let active = route.path === rootRoute.path

          return route.linkText
            ? <li key={k} className={active ? "active" : null}>
                <Link
                  to={mapRoute(route.path)}
                  className={(!expanded && active) || route.hide ? 'hide' : ''}>

                  {route.glyph && <Glyphicon glyph={route.glyph}>&nbsp;</Glyphicon>}
                  {route.linkText}
                </Link>

                {!this.state.expanded && active && <ol className="breadcrumb">
                  {_.reduce(
                    this.props.routes.slice(1),
                    (acc, item, index) => {
                      if (!item.component)
                         console.log("WARN: Navigation item " + item.path + " does not have valid component")

                      if (!item.path || item.path === '/' || item.path === '*')
                        return acc

                      acc.crumbs.push(<li key={index}>
                        <Link to={mapRoute([acc.path , item.path || ''])}>
                          {item.glyph && <Glyphicon glyph={item.glyph}>&nbsp;</Glyphicon>}
                          {item.linkText || item.component.name}
                        </Link>
                      </li>)

                      acc.path += '/' + (item.path || '')

                      return acc
                    },
                    {crumbs: [], path: ''}).crumbs}
                </ol>}

              </li>
            : null
        })}

        <li className="suffix pull-right">
          <a onClick={() => AuthService.logout(AuthConstants.LogoutReasons.sessionExpire)}>
            <Glyphicon glyph="off">&nbsp;</Glyphicon>
            Logout
          </a>
        </li>

        <li className="suffix pull-right">
          <Link to="/user">
            <Glyphicon glyph="envelope">&nbsp;</Glyphicon>
            User Account
          </Link>
        </li>
      </ul>
    </div >
    )
  }
}

