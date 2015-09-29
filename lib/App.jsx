import React from 'react'
import Router from 'react-router'
import {Route, RouteHandler, IndexRoute} from 'react-router'

import {About} from './components/About.jsx'
import {Dashboard} from './components/Dashboard.jsx'
import {Landing} from './components/Landing.jsx'
import {NotFound} from './components/NotFound.jsx'

import RouterService from './services/Router.jsx'
import AuthActions from './actions/Auth.jsx'
import AuthStore from './stores/Auth.jsx'

import './style/app.scss'

import _ from 'lodash'

require('./dispatchers/App.jsx').register(function(ev) {
  console.log('got ev: ', ev)
})

let auth = localStorage.getItem('auth')
if (auth)
  AuthActions.login(JSON.parse(auth))


export default class App extends React.Component {
  componentDidMount() {
    var body = document.getElementsByTagName('body')[0]
    body.className = _.without(body.className.split(' '), 'blockloader-init').join(' ')
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

React.render((
  <Router>
    <Route path="/" component={ App }>

      <IndexRoute component={ Landing } onEnter={redirectIfAuthenticated} />

      <Route path="dashboard" component={ Dashboard } />
      <Route path="about" component={ About } />

      <Route path="/*" component={ NotFound } />
    </Route>
  </Router>
  ), document.getElementById("react") )
