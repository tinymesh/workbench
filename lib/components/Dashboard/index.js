import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import _ from 'lodash'

import BodyClass from 'react-body-classname'

import {Loading, Navigation} from '../../ui'

import {Overview} from './Overview.jsx'
import {Network} from './Network.jsx'
import {Device} from './Device.jsx'

import {NotFound} from '../'
import {AuthStore} from '../../Auth'
import {NetworkStore, NetworkService} from '../../Networks'

export class Dashboard extends React.Component {
  constructor() {
    super()

    this.state = {
      networks: NetworkStore.networks
    }
  }

  componentWillMount() {
    NetworkStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({networks: NetworkStore.networks})
    })

    if (!NetworkStore.networks)
      NetworkService.list()
  }

  componentWillUnmount() {
    this._mounted = false
    NetworkStore.removeChangeListener(this._changeListener)
  }

  render() {
    let myUser = 'user/' + AuthStore.auth.owner
    let
      myNetworks = [],
      networkByEnt = {}

    _.each(this.state.networks, (network) => {
      _.each(network.parents, (parent) => {
        if (parent.match(/^user\//)) {
          if (parent !== myUser)
            return

          myNetworks.push(network)
          return
        }

        parent = parent.replace(/^organization\//, '')
        if (!networkByEnt[parent])
          networkByEnt[parent] = []

        networkByEnt[parent].push(network)
      })
    })

    console.log(myNetworks)
    console.log(networkByEnt)

    return (
      <BodyClass className="full-height theme-normal dashboard">
        <Grid fluid={true} style={{height: '100%', position: 'relative'}}>
          <Col md={3} lg={2} className="sidebar">
            <h4>My Networks</h4>
            <Nav>
              {myNetworks.map( (net) =>
                <LinkContainer to={`/dashboard/network/${net.key}`} key={net.key}>
                  <NavItem>{net.name || net.key}</NavItem>
                </LinkContainer>
              )}
            </Nav>

            {_.map(networkByEnt, (networks, parent) =>
              <div key={`networks-${parent}`}>
                <h4>{parent}</h4>
                <Nav>
                  {networks.map( (net) =>
                    <LinkContainer to={`/dashboard/network/${net.key}`} key={net.key}>
                      <NavItem>{net.name || net.key}</NavItem>
                    </LinkContainer>
                  )}
                </Nav>
              </div>
            )}
          </Col>

          <Col md={9} lg={10}>
            <Row>
              <Navigation routes={this.props.routes} />
            </Row>

            <Loading loading={!this.state.networks}>
              {this.props.children}
            </Loading>
          </Col>
        </Grid>
      </BodyClass>
    )
  }
}

Dashboard.childRoutes = [
  {
    path: '/',
    component: Overview,
    childRoutes: Overview.childRoutes
  },
  {
    path: 'network/:nid',
    component: Network,
    childRoutes: Network.childRoutes
  },
  {
    path: 'device/:nid/:device',
    component: Device,
    childRoutes: Device.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
