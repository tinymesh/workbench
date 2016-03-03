import React from 'react'
import _ from 'lodash'

import {Row, Col} from 'react-bootstrap'
import {Input, Button, Glyphicon} from 'react-bootstrap'
import {Nav, NavItem} from 'react-bootstrap'
import {Link} from 'react-router'

import {FormattedRelative} from 'react-intl'


import API from '../../API'
import {AddressEncoder} from '../../ui'

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
         <Link
            className="col-xs-12 col-md-6 network"
            to={`/dashboard/network/${network.key}`}>

            <span className="title">{network.name || network.key}</span>
            <span className="address">{AddressEncoder.encode(network.address)}</span>

            <span className="connstate">
               {0 !== total && active === total && <span className="good"    ><Glyphicon glyph="ok"     /> <span className="active">{active}</span> / <span className="total">{total}</span></span>}
               {0 !== total && 0 !== active && (active < total) && <span className="degraded"><Glyphicon glyph="flag"   /> <span className="active">{active}</span> / <span className="total">{total}</span></span>}
               {0 !== total && 0 === active && <span className="failed"  ><Glyphicon glyph="remove" /> <span className="active">{active}</span> / <span className="total">{total}</span></span>}
               {0 === total && <span className="unused" >...</span>}
            </span>

            {connected !== -1 && <span className="connected"><FormattedRelative value={connected} /></span>}
            {connected === -1 && <span className="connected">Never connected</span>}
         </Link>
      )
   }
}

class NetworkList extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         search: ""
      }

      this.handleInput = this.handleInput.bind(this)
   }

   handleInput(ev) {
      ev.preventDefault()

      this.setState({search: ev.target.value})
   }

   render() {
      let
         {networks} = this.props,
         {search} = this.state,
         filtered = _.filter(networks, (e) => JSON.stringify(e).match(new RegExp(search, "i")))

      return (
         <div>
            <Row className="showof">
               <Col xs={12} md={4}>
                  <div className="box">
                     <h3 style={{fontWeight: 'bold'}}>Getting started</h3>

                     <Row>
                        <Col xs={12}>
                           <p>
                              Welcome to the Tinymesh Workbench, the tool for
                              working with your connected Tinymesh devices.
                              You have created and connected your first Tinymesh
                              network meaning your closer to getting your full
                              application up and running.
                           </p>

                           <p>
                              The next steps will be to learn more about the Workbench,
                              and the API that powers it.
                           </p>

                           <p>
                              <a
                                 target="new"
                                 href="https://docs.tiny-mesh.com"
                                 className="btn btn-default btn-sm pull-right">

                                 Read the documentation
                              </a>
                           </p>
                        </Col>
                     </Row>
                  </div>
               </Col>

               <Col xs={12} md={6} style={{marginTop: "20px"}}>
                  <Row className="input">
                     <Col md={9}>
                        <h4>Your networks</h4>
                     </Col>

                     <Col xs={12} md={3}>
                        <Input
                           type="text"
                           value={search}
                           onChange={this.handleInput}
                           placeholder="Filter networks..."
                           hasFeedback>

                           <Glyphicon glyph="search" className="form-control-feedback" />
                        </Input>
                     </Col>

                     <Col xs={12}>
                        {_.map(filtered, net =>
                           <API.DeviceList
                              key={net.key}
                              nid={net.key}>

                              <NetworkNavLink network={net} />
                           </API.DeviceList>
                        )}
                     </Col>
                  </Row>
               </Col>
            </Row>
         </div>
      )
   }
}

export class Overview extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="overview">
         <API.Networks>
            <NetworkList />
         </API.Networks>
      </div>
    )
  }
}

Overview.sidebar = false
