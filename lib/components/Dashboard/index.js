import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {Link} from 'react-router'
import {FormattedRelative} from 'react-intl'

import _ from 'lodash'

import BodyClass from 'react-body-classname'

import {Navigation} from '../../ui'

import {Overview} from './Overview.jsx'
import {Network} from './Network'
import {Device} from './Device'
import {SetupGuide} from './SetupGuide.jsx'

import {NotFound} from '../NotFound.jsx'
import {AuthStore} from '../../Auth'
import {UserStore, UserService} from '../../User'
import {StreamEmitter} from '../../Stream.jsx'
import {NetworkStore, NetworkService} from '../../stores/Network'
import {DeviceService} from '../../stores/Device'

import API from '../../API'

var brand = require('../../../public/images/workbench.png')

class NetworkNavLink extends React.Component {
   render() {
      let
         {devices, network} = this.props,
         active, total, connected

      [active, total, connected] = _.reduce(devices, (acc, dev) => {
         if (dev.type !== 'gateway')
            return acc

         acc[1]++

         if (dev.meta['chan/disconnected'] < dev.meta['chan/connected']) {
            acc[0]++

            if (acc[2] === -1 || dev.meta['chan/connected'] < acc[2])
               acc[2] = dev.meta['chan/connected']
         } else if (dev.meta['chan/disconnected']) {
            // This is simplified, just give us the time of the last
            // state change
            if (acc[2] === -1 || dev.meta['chan/disconnected'] < acc[2])
               acc[2] = dev.meta['chan/disconnected']
         }

         return acc
      }, [0, 0, -1])

      return (
         <LinkContainer
            className="network"
            to={`/dashboard/network/${network.key}`}>

            <NavItem title={connected !== -1 ? <FormattedRelative value={connected} /> : "Never connected"}>
               <span className="title">{network.name || network.key}</span>

               <span className="connstate">
                  {0 !== total && active === total && <span className="good"><Glyphicon glyph="ok"/></span>}
                  {0 !== total && 0 !== active && (active < total) && <span className="degraded"><Glyphicon glyph="flag"/></span>}
                  {0 !== total && 0 === active && <span className="failed"><Glyphicon glyph="remove" /></span>}
                  {0 === total && <span className="unused" >...</span>}
               </span>

            </NavItem>
         </LinkContainer>
      )
   }
}

class NetworkNav extends React.Component {
   render() {
      let {networks} = this.props

      return (
         <Nav>
            {_.map(networks, net =>
               <API.DeviceList
                  key={net.key}
                  nid={net.key}>

                  <NetworkNavLink network={net} />
               </API.DeviceList>
            )}
         </Nav>
      )
   }
}

export class Dashboard extends React.Component {
  constructor() {
    super()

    this.state = {
      networks: NetworkStore.networks,
      expandSidebar: null,
      stream: null,
      streamQuery: null,
      streamFrom: [],
      networks: null,

      bodyRect: null,
      boundingRect: null,
      parentRect: null
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

    window.removeEventListener('resize', this._autosizeListener)
  }

   updateRectState() {
      let {autosize} = this.refs

      this.setState({
         bodyRect: document.getElementsByTagName("body")[0]
                              .getBoundingClientRect(),
         boundingRect: autosize.getDOMNode()
                               .getBoundingClientRect(),
         parentRect: autosize.getDOMNode()
                             .parentNode
                             .getBoundingClientRect()
      })
   }

   componentDidMount() {
      this.updateRectState()
      window.addEventListener('resize', this._autosizeListener = () => this.updateRectState());
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

    let setupActive = "true" === this.props.location.query.setup

    let
      {bodyRect, parentRect} = this.state,
      height = 0

    if (parentRect && bodyRect)
      height = Math.max(bodyRect.height, bodyRect.bottom) - 60

    return (
      <BodyClass className={"full-height theme-normal dashboard " + (collapse ? 'collapsed' : 'expanded')}>
        <Grid fluid={true} style={{height: '100%', position: 'relative'}}>

          <Row>
            <Col
              className="nav-branding"
              xs={4}
              md={3}
              lg={2}>

               <Link to="/"><img src={brand} style={{width: '80%', padding: '7% 5% 10%'}}  /></Link>
            </Col>

            <Col
               className="nav-container"
               xs={8}
               md={9}
               lg={10}>

               <Navigation {...this.props} />
            </Col>
          </Row>

          <Row>
          <Col
            xs={collapse ? 1 : 4}
            md={collapse ? 1 : 3}
            lg={collapse ? 1 : 2}
            ref="autosize"
            style={{height: `${height}px`}}
            className="sidebar">


            <h4>Networks</h4>
            <API.Networks><NetworkNav /></API.Networks>


            <Nav className="meta-links">
               <NavItem
                  href="#/dashboard?setup=true"
                  active={setupActive}>

                  Create new network</NavItem>
            </Nav>

            <a className="expand" onClick={() => this.setState({expandSidebar: !this.state.expandSidebar})}>
               <Glyphicon glyph={collapse ? "chevron-right" : "chevron-left"}/>
            </a>
          </Col>

          <Col
            xs={collapse ? 11 : 8}
            md={collapse ? 11 : 9}
            lg={collapse ? 11 :10}
            className="main">

            <API.Networks>
              <div>
                {!showSetupGuide && this.props.children}
                {showSetupGuide && <SetupGuide {...this.props} />}
              </div>
            </API.Networks>
          </Col>
         </Row>
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
