import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import _ from 'lodash'

import BodyClass from 'react-body-classname'

import {Loading, Navigation} from '../../ui'

import {Overview} from './Overview.jsx'
import {Network} from './Network'
import {Device} from './Device.jsx'
import {SetupGuide} from './SetupGuide.jsx'

import {NotFound} from '../'
import {AuthStore} from '../../Auth'
import {NetworkStore, NetworkService} from '../../Networks'

export class Dashboard extends React.Component {
  constructor() {
    super()

    this.state = {
      networks: NetworkStore.networks,
      expandSidebar: null
    }
  }

  componentWillMount() {
    this._mounted = true
    NetworkStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({networks: NetworkStore.networks})
    })

    NetworkService.list()
  }

  componentWillUnmount() {
    this._mounted = false
    NetworkStore.removeChangeListener(this._changeListener)
  }

  render() {
    let myUser = AuthStore.auth.owner
    let
      myNetworks = [],
      networkByEnt = {},
      networkCount = 0


    _.each(this.state.networks, (network) => {
      _.each(network.parents, (parent) => {
        if (parent.match(/^user\//)) {
          if (parent !== myUser)
            return

          myNetworks.push(network)
          networkCount++
          return
        }

        parent = parent.replace(/^organization\//, '')
        if (!networkByEnt[parent])
          networkByEnt[parent] = []

        networkByEnt[parent].push(network)
        networkCount++
      })
    })

    let
      collapse = null === this.state.expandSidebar ? networkCount === 0 : !!this.state.expanded,
      showSetupGuide = networkCount === 0

    return (
      <BodyClass className="full-height theme-normal dashboard">
        <Grid fluid={true} style={{height: '100%', position: 'relative'}}>
          <Col
            xs={collapse ? 1 : 4}
            md={collapse ? 1 : 3}
            lg={collapse ? 1 : 2}
            className={"sidebar" + (collapse ? ' collapse collapsed' : '')}>

            <div className={this.props.children.type.sidebar ? 'collapse' : ''}>
              {0 !== networkCount && <div>
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

              </div>}

              {!networkCount &&
                <div>
                  You don't have any networks
                </div>
              }
            </div>
          </Col>

          <Col
            xs={collapse ? 1 : 4}
            md={collapse ? 1 : 3}
            lg={collapse ? 1 : 2}
            className={"sidebar" + (collapse ? ' collapsed' : ' collapse')}>

            <a
              className="expand-btn"
              onClick={() => this.setState({expandSidebar: !this.state.expand})}>

              <span className="padding">&nbsp;</span>
              <Glyphicon glyph="chevron-right" />
            </a>
          </Col>

          <Col
            xs={collapse ? 11 : 8}
            md={collapse ? 11 : 9}
            lg={collapse ? 11 :10}
            className={"main" + (collapse ? ' expand' : '')}>

            <Row>
              <Navigation {...this.props} />
            </Row>

            <Loading loading={!this.state.networks}>
              <div>
                {!showSetupGuide && this.props.children}
                {showSetupGuide && <SetupGuide {...this.props} />}
              </div>
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
