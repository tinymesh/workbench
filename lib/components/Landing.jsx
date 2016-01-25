import React from 'react/addons'
import Mixin from 'react-mixin'

import BodyClass from 'react-body-classname'

import {Grid, Row, Col} from 'react-bootstrap'
import {Button, Input, Alert} from 'react-bootstrap'

import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import {Box} from '../ui'
let branding = require('../../public/images/workbench-neg.png')

import {UserService} from '../User'
import {AuthStore, AuthService, AuthConstants} from '../Auth'
import AppDispatcher from '../AppDispatcher'

export class Landing extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
    login: {
        user: '',
        password: '',
      },
    register: {
        email: '',
        password: '',
        confirm_password: '',
        name: '',
      },
      notification: undefined
    }
  }

  login(ev) {
    ev.preventDefault()

    var username = this.state['login.user'], password = this.state['login.password']

    AuthService.login(username, password)
      .catch((resp) => {
        let msg = "an unknown error occured"

        if (_.isError(resp)) {
          console.log("caught error", err.message)
          console.log(err.stack)
          msg = err.message
        } else {
          msg = resp.data.error || JSON.stringify(resp.data)
        }

        this.setState({
          'notification': {
            style: 'danger',
            message: "Error logging in: " + msg
          },
          'login.password': ''
        })
      })

    this.setState({notification: undefined, 'login.password': ''})
  }

  register(ev) {
    ev.preventDefault()

    var
      username = this.state['register.email'],
      passwordA = this.state['register.password'],
      passwordB = this.state['register.confirm-password']


    if (!username) {
      this.setState({'notification': {style: 'warning', message: "We need a email address to register you"}});
      return
    }

    if (!passwordA) {
      this.setState({'notification': {style: 'warning', message: "You really should use a password "}});
      return
    }

    if (!passwordB) {
      this.setState({'notification': {style: 'warning', message: "Seems like you forgot to confirm your password"}});
      return
    }

    if (passwordA != passwordB) {
      this.setState({'notification': {style: 'warning', message: "The passwords did not match, try again!"}});
      return
    }

    UserService.register(username, passwordA)
      .then( (resp) => AuthService.login(username, passwordA) )
      .catch((resp) => {
        let msg = "an unknown error occured"

        if (_.isError(resp)) {
          console.log("caught error", err.message)
          console.log(err.stack)
          msg = err.message
        } else {
          msg = resp.data.error || JSON.stringify(resp.data)
        }

        this.setState({
          'notification': {
            style: 'danger',
            message: "Error creating new user: " + msg
          },
          'register.password': '',
          'register.confirm-password': ''
        })
      })

    this.setState({
      'notification': undefined,
      'register.password': '',
      'register.confirm-password': '',
    })
  }

  componentDidMount() {
    // refresh on user:login
    this._token = AppDispatcher.register( (action) => {
      switch (action.actionType) {
        case AuthConstants.Actions.login:
          this.props.history.pushState(null, '/dashboard')
          break

        default:
          break
      }
    })
  }

  componentwillUnmount() {
    AppDispatcher.unregister(this._token)
  }

  render() {
    let info = (<Box.Info>
                  <p>
                    You are using a beta product, it may not work as
                    expected at all times but by giving us feedback we
                    improve it over time!
                  </p>

                  <p>
                    <em>By logging in to the <strong>Tinymesh Cloud™</strong> you agree to
                    our terms of service.</em>
                  </p>
                </Box.Info>)


    let register = "true" === this.props.location.query.register

    let logoutReason

    switch (this.props.location.query.logout) {
      case 'undefined':
      case AuthConstants.LogoutReasons.user:
        logoutReason = "You have been logged out"; break;

      case AuthConstants.LogoutReasons.sessionExpire:
        logoutReason = "Your have been logged out because of inactivity"; break;

      default:
        break;
    }

    return (
      <BodyClass className="theme-blue">
        <div>
        <div className="branding top left">
          <a href="/" title="Workbench">
            <img src={branding} width="150" />
          </a>
        </div>
        <Grid className="landing">
          {logoutReason && <Row>
            <Alert bsStyle="info">{logoutReason}</Alert>
          </Row>}

          <Row>

            <Col xs={12} sm={4} md={6} className="copy text-center">
              <p className="lead">
                Sense, Monior and Control <strong>any device</strong>
              </p>

              <p className="body">
                Sense inputs, monitor alerts, or control outputs
                of your <strong>Tiny Mesh™</strong> device from anywhere in the world!
              </p>

              <p>
                <LinkContainer to="/" query={{register: true}}>
                  <Button bsStyle="success">Sign Up</Button>
                </LinkContainer>
                &nbsp;
                <a href="https://tiny-mesh.com">
                  <Button>Learn more at tiny-mesh.com</Button>
                </a>
              </p>
            </Col>

            <Col xs={12} sm={8} md={6}>
              <Box show={!register}>
                <Box.Title>Login</Box.Title>

                {this.state.notification &&
                  <Box.Notify style={this.state.notification.style}>
                    {this.state.notification.message}
                  </Box.Notify>}

                <Box.Content>

                <form onSubmit={this.login.bind(this)}>
                  <div className="form-group">
                    <label htmlFor="login-email">Email address</label>
                    <div className="input-group">
                      <span className="input-group-addon" id="at-addon">@</span>
                      <input
                        type="text"
                        className="form-control"
                        name="login-email"
                        id="login-email"
                        valueLink={this.linkState('login.user')}
                        placeholder="email@address" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <div className="input-group">
                      <span className="input-group-addon" id="at-addon">***</span>
                      <input
                        type="password"
                        className="form-control"
                        name="login-password"
                        id="login-password"
                        valueLink={this.linkState('login.password')}
                        placeholder="********" />
                    </div>
                  </div>

                  <div className="text-right">
                    <Button
                      bsStyle="success"
                      type="submit"
                      onSubmit={this.login.bind(this)}
                      onClick={this.login.bind(this)}>
                      Sign in
                    </Button>
                  </div>
                </form>

                  <Link to="/" query={{register: true}}>Don't have an account? Sign up!</Link>
                </Box.Content>
                {info}
              </Box>

              <Box show={register}>
                <Box.Title>Create a new account</Box.Title>

                {this.state.notification &&
                  <Box.Notify style={this.state.notification.style}>
                    {this.state.notification.message}
                  </Box.Notify>}

                <Box.Content>

                  <form onSubmit={this.login.bind(this)}>
                    <div className="form-group">
                      <label htmlFor="register-email">Email address</label>
                      <div className="input-group">
                        <span className="input-group-addon" id="at-addon">@</span>
                        <input
                          type="text"
                          className="form-control"
                          name="register-email"
                          id="register-email"
                          valueLink={this.linkState('register.email')}
                          placeholder="email@address.com" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-password">Password</label>

                      <div className="input-group">
                        <span className="input-group-addon" id="at-addon">***</span>
                        <input
                          type="password"
                          className="form-control"
                          name="register-password"
                          id="register-password"
                          valueLink={this.linkState('register.password')}
                          placeholder="********" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="register-confirm-password">Confirm Password</label>

                      <div className="input-group">
                        <span className="input-group-addon" id="at-addon">***</span>
                        <input
                          type="password"
                          className="form-control"
                          name="register-confirm-password"
                          id="register-confirm-password"
                          valueLink={this.linkState('register.confirm-password')}
                          placeholder="********" />
                      </div>
                    </div>

                    <div className="text-right">
                      <Button
                        bsStyle="success"
                        type="submit"
                        onSubmit={this.register.bind(this)}
                        onClick={this.register.bind(this)}>
                        Register
                      </Button>
                    </div>
                  </form>
                  <Link to="/" query={{register: false}}>Already have an account? Sign in</Link>
                </Box.Content>
                {info}
              </Box>
            </Col>
          </Row>

          <Row className="footer">
            <Col xs={12}>
              <span className="links muted">
                © 2012-2015 <a href="https://tiny-mesh.com">Tiny Mesh AS</a>
              </span>
            </Col>
          </Row>
        </Grid>
        </div>
      </BodyClass>
    )
  }
}

Mixin(Landing.prototype, React.addons.LinkedStateMixin)
