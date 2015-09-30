import React from 'react/addons'
import Mixin from 'react-mixin'

import BodyClass from 'react-body-classname'

import {Grid, Row, Col} from 'react-bootstrap'
import {Button, Input} from 'react-bootstrap'

import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import {Box} from '../UI.jsx'
let branding = require('../../public/images/workbench-neg.png')

import {AuthStore, AuthService} from '../Auth'
import AppDispatcher from '../App.jsx'

export class Landing extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      user: '',
      password: '',
      notification: undefined
    }
  }

  login() {
    var username = this.state.user, password = this.state.password

    AuthService.login(this.state.user, this.state.password)
      .catch((err) => {
        let msg = (err.data.error ? err.data.error : JSON.stringify(err.data))

        this.setState({
          notification: {
            style: 'danger',
            message: "Error logging in: " + msg
          }
        })
      })

    this.setState({notification: undefined})
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
    return (
      <BodyClass className="theme-blue">
        <div>
        <div className="branding top left">
          <a href="/" title="Workbench">
            <img src={branding} width="150" />
          </a>
        </div>
        <Grid className="landing">
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

                <form>
                  <div className="form-group">
                    <label htmlFor="login-email">Email address</label>
                    <div className="input-group">
                      <span className="input-group-addon" id="at-addon">@</span>
                      <input
                        type="text"
                        className="form-control"
                        name="login-email"
                        id="login-email"
                        valueLink={this.linkState('user')}
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
                        valueLink={this.linkState('password')}
                        placeholder="********" />
                    </div>
                  </div>

                  <div className="text-right">
                    <Button
                      bsStyle="success"
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
                <Box.Content>

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
