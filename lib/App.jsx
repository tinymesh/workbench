import React from 'react'
import Router from 'react-router'
import {Route, RouteHandler, IndexRoute} from 'react-router'

import {About, User, Dashboard, Landing, NotFound} from './components'
import {RequireAuth, Loading} from './ui'

import {AuthStore, AuthService, AuthConstants} from './Auth'
import AppDispatcher from './AppDispatcher'

import {ErrorModal} from './ErrorModal.jsx'

import './style/app.scss'

import _ from 'lodash'

let auth = localStorage.getItem('auth')


let haveAuthentication = false // this is outside of flux dispatcher
export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      loading: !!auth
    }

    window.onerror = this.handleThrownErrors.bind(this)
    this.clearError = this.clearError.bind(this)
  }

  componentDidMount() {
    var body = document.getElementsByTagName('body')[0]
    body.className = _.without(body.className.split(' '), 'blockloader-init').join(' ')

    if (auth)
      AuthService.validate(JSON.parse(auth))
                 .then(() => this.setState({loading: false}))
                 .catch(() => this.setState({loading: false}))

    // refresh on user:(login,logout)
    AppDispatcher.register( (action) => {
      switch (action.actionType) {
        case AuthConstants.Actions.logout:
          haveAuthentication = true
          break

        case AuthConstants.Actions.logout:
          this.props.history.pushState(null, '/?logout=' + action.reason);
          break

        default:
          break
      }
    })
  }

  handleThrownErrors(msg, file, line, col, err) {
    col = col || (window.event && window.event.errorCharacter);
    let
      stack = err ? err.stack : null,
      data = {
         message:    msg,
         file:       file,
         line:       line,
         column:     col,
         stack:      stack
     }

    this.setState({error: data})

    return false
  }

  clearError() {
    this.setState({error: null})
  }

  render() {
    let {error, loading} = this.state

    return (
      <Loading loading={loading} text="Waiting for authentication reply from server">
        <div>
          <ErrorModal onHide={this.clearError} error={error} />
          {this.props.children}
        </div>
      </Loading>
    )
  }
}

React.render((
  <Router>
    <Route path="/" component={ App }>

      <IndexRoute component={ Landing } />

      <Route path="dashboard"
        component={ RequireAuth(Dashboard) }
        indexRoute={Dashboard.childRoutes[0]}
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
        component={ RequireAuth(User) }
        linkText="User Account"
        glyph="user"
        hide={true}
        indexRoute={User.childRoutes[0]}
        childRoutes={User.childRoutes} />

      <Route path="about" component={ About } />

      <Route path="/*" component={ NotFound } />
    </Route>
  </Router>
  ), document.getElementById("react") )
