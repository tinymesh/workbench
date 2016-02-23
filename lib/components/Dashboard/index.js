import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import _ from 'lodash'

import BodyClass from 'react-body-classname'

import {Loading, Navigation} from '../../ui'

import {Overview} from './Overview.jsx'
import {Network} from './Network'
import {Device} from './Device'
import {SetupGuide} from './SetupGuide.jsx'

import {NotFound} from '../'
import {AuthStore} from '../../Auth'
import {UserStore, UserService} from '../../User'
import {StreamEmitter} from '../../Stream.jsx'
import {NetworkStore, NetworkService} from '../../stores/Network'
import {DeviceService} from '../../stores/Device'

export class Dashboard extends React.Component {
  constructor() {
    super()

    this.state = {
      networks: NetworkStore.networks,
      expandSidebar: null,
      stream: null,
      streamQuery: null,
      streamFrom: [],
      networks: null
    }

    this.onUser = this.onUser.bind(this)
    this.onNetwork = this.onNetwork.bind(this)
    this.onDevice = this.onDevice.bind(this)
    this.onStream = this.onStream.bind(this)
  }

  stream(nids, force) {
    if (this.state.stream && !force)
      throw("Stream already open, close beforehand")

    let
      mapper = (nid) => `network/${nid};device/${nid}/*;stream/${nid}`,
      streamQuery = [AuthStore.auth.owner].concat(_.map(nids, mapper)).join(";"),
      stream = new StreamEmitter(streamQuery)

    if (this.state.streamQuery === streamQuery)
      return

    stream.on("user", this.onUser)
    stream.on("network", this.onNetwork)
    stream.on("device", this.onDevice)
    stream.on("stream", this.onStream)

    return stream
  }

  onUser(user) {
    if (user.networks) {
      UserService.fetch()
      NetworkService.list()
    }
  }

  onNetwork(network) {
    NetworkService.fetch(network._id)
  }

  onDevice(device) {
    if (!device.network && !device.key && !device._id)
      return

    let
      nid = device.network,
      key = device.key

    if (!nid && device._id)
      nid = device._id.split('/')[0]

    if (!key && device._id)
      key = device._id.split('/')[1]

    DeviceService.fetch(nid, key)
  }

  onStream(ev) {
  }

  componentWillMount() {
    this._mounted = true
    NetworkStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({networks: NetworkStore.networks})
    })

    UserStore.addChangeListener( this._userChange = () => {
      if (_.eq(this.state.streamFrom, UserStore.user.networks))
        return

      let user = UserStore.user

      if (this.state.stream) {
        this.state.stream.close()

        this.setState({
          streamFrom: user.networks,
          stream: this.stream(user.networks, true)
        })
      } else {
        this.setState({
          streamFrom: user.networks,
          stream: this.stream(user.networks)
        })
      }
    })

    NetworkService.list()
    UserService.fetch()
  }

  componentWillUnmount() {
    this._mounted = false

    NetworkStore.removeChangeListener(this._changeListener)

    if (this.state.stream)
      this.state.stream.close();
  }

  render() {
    let myUser = AuthStore.auth.owner
    let
      myNetworks = [],
      networkByEnt = {},
      networkCount = 0


    _.each(this.state.networks, (network) => {
      _.each(network.parents, (parent) => {
        networkCount++
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

    let
      explicitSidebar = true === this.state.expandSidebar,
      childSidebar = ((this.props.children || {}).type || {}).sidebar,
      collapse = true !== explicitSidebar && false === childSidebar,
      showSetupGuide = this.props.location.query.setup || networkCount === 0

    let nid = this.props.params.nid
    return (
      <BodyClass className="full-height theme-normal dashboard">
        <Grid fluid={true} style={{height: '100%', position: 'relative'}}>
          <Col
            xs={collapse ? 1 : 4}
            md={collapse ? 1 : 3}
            lg={collapse ? 1 : 2}
            className={"sidebar" + (collapse ? ' collapse collapsed' : '')}>

            <div className={collapse ? 'collapse' : ''} style={{height: '100%'}}>
              <h4>My Networks</h4>
              {0 !== networkCount &&
               <div>
                <Nav>
                  {myNetworks.map( (net) =>
                    <LinkContainer to={`/dashboard/network/${net.key}`} key={net.key} active={net.key === nid}>
                      <NavItem>{net.name || net.key}</NavItem>
                    </LinkContainer>
                  )}
                </Nav>

                {_.map(networkByEnt, (networks, parent) =>
                  <div key={`networks-${parent}`}>
                    <h4>{parent}</h4>
                    <Nav>
                      {networks.map( (net) =>
                        <LinkContainer to={`/dashboard/network/${net.key}`} key={net.key} active={net.key === nid}>
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

              <Nav>
               <LinkContainer to="/dashboard?setup=true">
                  <NavItem>+ Create new network</NavItem>
               </LinkContainer>
              </Nav>
            </div>
          </Col>

          <Col
            xs={collapse ? 1 : 4}
            md={collapse ? 1 : 3}
            lg={collapse ? 1 : 2}
            className={"sidebar" + (collapse ? ' collapsed' : ' collapse')}
            style={{height: '100%'}}>

            <a
              className="expand-btn"
              onClick={() => this.setState({expandSidebar: true})}>

              <span className="padding">&nbsp;</span>
              <Glyphicon glyph="chevron-right" />
            </a>
          </Col>

          <Col
            xs={collapse ? 11 : 8}
            md={collapse ? 11 : 9}
            lg={collapse ? 11 :10}
            style={{height: '100%'}}
            className={"main" + (collapse ? ' expand' : '')}>

            <Row>
              <Navigation {...this.props} />
            </Row>

            <Loading loading={!this.state.networks}>
              <div style={{height: '100%'}}>
                {!showSetupGuide && React.cloneElement(this.props.children, {networks: this.state.networks})}
                {showSetupGuide && <SetupGuide networks={this.state.networks} {...this.props} />}
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
    path: 'device/:nid/:key',
    component: Device,
    childRoutes: Device.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
