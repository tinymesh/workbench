import React from 'react'
import {Link} from 'react-router'
import {Glyphicon} from 'react-bootstrap'

import {AuthService, AuthConstants} from '../Auth'

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
    let lastRoute = this.props.routes[this.props.routes.length - 1]

    return (
      <ul className={"navigation " + (this.state.expanded ? 'expanded' : 'unexpanded')}>
        <li className="prefix">
          <a onClick={this.toggleMenu.bind(this)} title="Expand">
            <Glyphicon glyph={this.state.expanded ? "minus" : "plus"} />
          </a>
        </li>
        {this.props.routes[0].childRoutes.map( (route, k) => {
          let active = route.path === lastRoute.path

          return route.linkText
            ? <li key={k} className={active ? "active" : null}>
                <Link to={route.path}>
                  {route.glyph && <Glyphicon glyph={route.glyph}>&nbsp;</Glyphicon>}
                  {route.linkText}
                </Link>
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
    )
  }
}

