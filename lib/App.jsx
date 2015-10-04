import React from 'react'
import Router from 'react-router'
import {Route, RouteHandler, IndexRoute} from 'react-router'

import {About} from './components/About.jsx'
import {User} from './components/User.jsx'
import {Dashboard} from './components/Dashboard.jsx'
import {Landing} from './components/Landing.jsx'
import {NotFound} from './components/NotFound.jsx'

import {AuthStore, AuthService, AuthConstants} from './Auth'
import AppDispatcher from './AppDispatcher'

import './style/app.scss'

import _ from 'lodash'

let auth = localStorage.getItem('auth')
if (auth)
  AuthService.validate(JSON.parse(auth))


export default class App extends React.Component {
  componentDidMount() {
    var body = document.getElementsByTagName('body')[0]
    body.className = _.without(body.className.split(' '), 'blockloader-init').join(' ')

    // refresh on user:(login,logout)
    AppDispatcher.register( (action) => {
      switch (action.actionType) {
        case AuthConstants.Actions.login:
          this.props.history.pushState(null, '/dashboard');
          break

        case AuthConstants.Actions.logout:
          this.props.history.pushState(null, '/?logout=' + action.reason);
          break

        default:
          break
      }
    })
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

let redirectIfAuthenticated = (nextState, replaceState)  => {
  if (AuthStore.haveAuthentication())
    replaceState(null, '/dashboard')
}

let redirectIfUnauthenticated = (nextState, replaceState)  => {
  if (!AuthStore.haveAuthentication())
    replaceState(null, '/')
}

React.render((
  <Router>
    <Route path="/" component={ App }>

      <IndexRoute component={ Landing } onEnter={redirectIfAuthenticated} />

      <Route path="dashboard"
              component={ Dashboard }
              onEnter={ redirectIfUnauthenticated }
              childRoutes={Dashboard.childRoutes}
              glyph="home"
              linkText="Dashboard" />

      <Route path="organizations"   component={ NotFound }  glyph="user"      linkText="Organizations" />
      <Route path="applications"    component={ NotFound }  glyph="book"      linkText="Applications" />
      <Route path="operations"      component={ NotFound }  glyph="scale"     linkText="Operations" />
      <Route path="getting-started" component={ NotFound }  glyph="flash"     linkText="Getting Started" />
      <Route path="help"            component={ NotFound }  glyph="education" linkText="Help & Support" />

      <Route
        path="user"
        component={ User }
        onEnter={ redirectIfUnauthenticated }
        indexRoute={User.childRoutes[0]}
        childRoutes={User.childRoutes} />

      <Route path="about" component={ About } />

      <Route path="/*" component={ NotFound } />
    </Route>
  </Router>
  ), document.getElementById("react") )
