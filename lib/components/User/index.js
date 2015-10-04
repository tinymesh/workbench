import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import BodyClass from 'react-body-classname'

import {Navigation} from '../../ui'

import {Login} from './Login.jsx'
import {Logout} from './Logout.jsx'
import {Register} from './Register.jsx'
import {Account} from './Account.jsx'
import {Tokens} from './Tokens.jsx'
import {Sessions} from './Sessions.jsx'
import {NotFound} from '../NotFound.jsx'

export {
  Login,
  Logout,
  Register,
  Account,
  Tokens,
  Sessions
}

export class User extends React.Component {
  render() {
// Use these in the future
//              <LinkContainer to="/user/account/layout"><NavItem>Layout Preferences</NavItem></LinkContainer>
//              <LinkContainer to="/user/account/overview"><NavItem>Overview</NavItem></LinkContainer>
//
//            <h4>Notifications</h4>
//            <Nav>
//              <LinkContainer to="/user/notifications"><NavItem>Preferences</NavItem></LinkContainer>
//              <LinkContainer to="/user/notifications/rules"><NavItem>Notification Rules</NavItem></LinkContainer>
//            </Nav>
//
//              <LinkContainer to="/user/auth/oauth"><NavItem>Oauth Authorizations</NavItem></LinkContainer>
    return (
      <BodyClass className="full-height theme-normal user">
        <Grid fluid={true} style={{height: '100%', position: 'relative'}}>
          <Col md={3} lg={2} className="sidebar">
            <h4>Account</h4>
            <Nav>
              <LinkContainer to="/user/account"><NavItem>Settings</NavItem></LinkContainer>
            </Nav>

            <h4>Sessions</h4>
            <Nav>
              <LinkContainer to="/user/auth/sessions"><NavItem>Sessions</NavItem></LinkContainer>
              <LinkContainer to="/user/auth/tokens"><NavItem>API Tokens</NavItem></LinkContainer>
            </Nav>
          </Col>

          <Col md={9} lg={10}>
            <Row>
              <Navigation routes={this.props.routes} />
            </Row>

            <Row>
              <Col xs={12}>
                {this.props.children}
              </Col>
            </Row>
          </Col>
        </Grid>
      </BodyClass>
    )
  }
}

User.childRoutes = [
  {
    path: 'account',
    component: Account,
    childRoutes: Account.childRoutes
  },
  {
    path: 'auth/tokens',
    component: Tokens,
    childRoutes: Tokens.childRoutes
  },
  {
    path: 'auth/sessions',
    component: Sessions,
    childRoutes: Sessions.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
