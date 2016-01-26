/**
 * Setup guide is shown for two cases:
 *  - there are no networks
 *  - the network shown is not fully provisioned (lacking gw, chans *  etc)
 *
 */
import React from 'react'
import Mixin from 'react-mixin'
import _ from 'lodash'
import Q from 'q'

import {Grid, Row, Col} from 'react-bootstrap'
import {Input, Glyphicon, Button, Alert} from 'react-bootstrap'
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import {Modal} from 'react-bootstrap'

import {LensedStateDefaultMixin} from '../../mixin'
import {NetworkStore, NetworkService} from '../../Networks'
import {DeviceService} from '../../stores/Device'

export class SetupGuideCreateNetwork extends React.Component {
  constructor() {
    super()

    this.state = {
      gateways: [],

      patch: {},

      newGWName: null,
      newGWAddr: null,

      confirm: null,
      confirmPromise: null,
      confirmStyle: null,
      confirmIcon: null,
      confirmTitle: null,
    }
  }

  createNetwork(ev) {
    var defered = Q.defer()

    if (this.state.patch.name)
      defered.resolve(this.state.patch)
    else
      this.setState({
        confirm:
          <div>
            <p>
              You are creating a network without a name.
            </p>
            <p>
              To distinguish
              different networks you can name it. The name can be anything
              but should identify the Network <em>(ie 'Tiny Mesh Office - Norway')</em>.
            </p>
          </div>,
        confirmPromise: defered
      })

   defered.promise.then((patch) => NetworkService.create(patch))
  }

  resolveConfirm() {
    this.state.confirmPromise.resolve()

    this.clearConfirm()
  }

  clearConfirm() {
    this.setState({
      confirm: null,
      confirmStyle: null,
      confirmIcon: null,
      confirmPromise: null,
      confirmTitle: null
    })
  }

  addGateway(ev) {
    ev.preventDefault()

    this.setState((prevState) => {
      prevState.gateways.push({name: this.state.newGWName, address: this.state.newGWAddr})
      return {gateways: prevState.gateways}
    })
  }

  removeGateway(ev, idx) {
    ev.preventDefault()

    this.setState((prevState) => {
      prevState.gateways.splice(idx, 1)
      return {gateways: prevState.gateways}
    })
  }

  saveGateways(ev) {
    ev.preventDefault()

   let ps = _.map(this.state.gateways, (gw) => {
      gw.address = parseInt(gw.address)
      return DeviceService.create(this.props.network.key, gw)
    })

   return Q.all(ps)
     .then(() => NetworkService.fetch(this.props.network.key))
     .catch(() => {
      this.setState({
        confirmIcon: 'warning-sign',
        confirmStyle: 'error',
        confirmTitle: 'Failed to create gateway(s)',
        confirm:
          <div>
            <p>
              An error occured when creating the gateways. Please try again later or contact support
            </p>
          </div>
      })
	  })
  }

  render() {
    return (
      <Row style={{marginTop: '50px'}}>
        <Col
          mdOffset={1} xs={12} sm={6} md={5} lg={3}
          style={{borderRight: '1px solid #eee', paddingRight: '6%'}}>

          <Modal
            className={"modal-" + this.state.confirmStyle || 'confirm'}
            show={!!this.state.confirm}
            onHide={this.clearConfirm.bind(this)}>

            <Modal.Header>
              <Modal.Title>
                <Glyphicon glyph={this.state.confirmIcon || "ok"}>&nbsp;</Glyphicon>
                {this.state.confirmTitle || "Confirm"}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>{this.state.confirm}</Modal.Body>

            <Modal.Footer>
              <Button onClick={this.clearConfirm.bind(this)} bsStyle="link">Close</Button>
              {this.state.confirmPromise && <Button onClick={this.resolveConfirm.bind(this)} bsStyle="primary">Okey, got it!</Button>}
            </Modal.Footer>
          </Modal>

          {!this.props.network
            ? (<div>
                <div className="page-header">
                  <h3>Create your first Network</h3>
                </div>

                <p className="lead">
                  To get started with the Tiny Mesh cloud you need a network.
                </p>

                <p>
                  Each network connects to one or more Tiny Mesh gateways and lets
                  you read date or send messages back to the network from the cloud.
                </p>
              </div>)
            : (<div>
                <div className="page-header">
                  <h3>Define the gateway</h3>
                </div>

                <p className="lead">
                  All Tinymesh networks require atleast one gateway.
                </p>

                <p>
                  The gateway authenticates with the Tinymesh Cloud and
                  relays data between the outside world and the radio network.
                </p>
              </div>)}
        </Col>

        <Col
          xs={10} sm={5}
          style={{marginTop: '7rem', marginLeft: '5%'}}
          className={this.props.network ? 'collapse' : ''}>
            <Col xs={10}>
              <Input
                type="text"
                valueLink={this.linkState('patch.name')}
                label="Network Name"
                help="A human readable name for the network"
                placeholder="My first network!" />
            </Col>
            <Col xs={2}>
              <label style={{display: 'block'}}>&nbsp;</label>
              <Button
                 bsStyle="primary"
                 onClick={(ev) => this.createNetwork(ev)}>

                <Glyphicon glyph="chevron-right">&nbsp;</Glyphicon>
                Create Network
              </Button>
            </Col>
        </Col>

        <Col xs={10} sm={5}
          style={{marginTop: '7rem', marginLeft: '5%'}}
          className={!this.props.network ? 'collapse' : ''}>

          <Row>
            <Col xs={5}>
              <Input
                type="text"
                valueLink={this.linkState('newGWAddr')}
                label="Gateway Address"
                help="The UID of the address"
                placeholder="0.0.0.0" />
            </Col>
            <Col xs={5}>
              <Input
                type="text"
                valueLink={this.linkState('newGWName')}
                label="Gateway Name"
                help={<span>A name for the new Gateway <em>(optional)</em></span>}
                placeholder="My Gateway ..." />
            </Col>
            <Col xs={1}>
              <label style={{display: 'block'}}>&nbsp;</label>
              <Button onClick={(ev) => this.addGateway(ev)}>Add</Button>
            </Col>
            <Col xs={1}>
              <label style={{display: 'block'}}>&nbsp;</label>
              <Button
               onClick={(ev) => this.saveGateways(ev)}>
                Continue
              </Button>
            </Col>
          </Row>

          {this.state.gateways.length > 0 &&
           <Row>
           <Col xs={10}>
            <hr />
            <ListGroup>
              {this.state.gateways.map((gw, idx) =>
                <ListGroupItem key={idx}>
                  <span className="name">{gw.name || "Unnamed Gateway"}</span>
                  &nbsp;&ndash;&nbsp;
                  <span className="addr">(<em>Address: {gw.address}</em>)</span>

                  <Button
                    onClick={(ev) => this.removeGateway(ev, idx)}
                    className="pull-right"
                    style={{marginTop: '-5px'}}
                    bsSize="small"
                    bsStyle="danger">

                    <Glyphicon glyph="remove">&nbsp;</Glyphicon>
                    Remove
                  </Button>
                </ListGroupItem>
              )}
            </ListGroup>
           </Col>
           </Row>
          }

        </Col>
      </Row>
    )
  }
}

Mixin(SetupGuideCreateNetwork.prototype, LensedStateDefaultMixin)

export class SetupGuideConnect extends React.Component {
  render() {
    let
      netaddr = this.props.network.address,
      nid = [
        ((netaddr >> 24) & 0xff).toString(16),
        ((netaddr >> 16) & 0xff).toString(16),
        ((netaddr >>  8) & 0xff).toString(16),
        ((netaddr >>  0) & 0xff).toString(16),
      ]

    return (
      <Row style={{marginTop: '50px'}}>
        <Col
          mdOffset={1} xs={12} sm={6} md={5} lg={3}
          style={{borderRight: '1px solid #eee', paddingRight: '6%'}}>


          <div>
            <div className="page-header">
              <h3>Connect to the Cloud</h3>
            </div>

            <p className="lead">
              Configure gateway & install a network connector
            </p>

            <p>
              A network connector relays data from the Tinymesh Gateway
              to the Tinymesh Cloud service. It does so by taking data
              from the Gateway UART and shipping it over TCP/IP to the
              Cloud Service.
            </p>
            <p>
              Before the gateway can connect you need to configure some
              authentication information.
            </p>
          </div>
        </Col>
        <Col xs={12} sm={6} md={6} lg={6}>
          <div>
            <p>
              Connect to the UART of the Tinymesh Gateway, then enable <code>Configuration Mode</code>.
              This is done by pressing the <code>CONFIG</code> button
              or triggering the <code>CONFIG</code> pin on the module itself.<br />
              Once in configuration mode a prompt <code>&gt;</code> will appear. Follow the steps below.
            </p>

            <Alert bsStyle="info"><b>Note:</b> You need to ensure that your Gateway has the same UID as set in previous step</Alert>


              <pre>
               rx    >     ; ready prompt<br />
               tx    G     ; enable gateway mode<br />
               rx    ><br />
               tx    M         ; enter memory<br />
               rx    ><br />
               tx    0x03 0x00 ; set to packet mode<br />
               tx    0x3a 0x24 ; set flow control<br />
               tx    0xff      ; exit memory<br />
               rx    ><br />
               tx    HW         ; enter calibration<br />
               rx    ><br />
               tx    0x17 0x{nid[0]} ; set network id<br />
               tx    0x18 0x{nid[1]}<br />
               tx    0x19 0x{nid[2]}<br />
               tx    0x1a 0x{nid[3]}<br />
               tx    0xff      ; exit calibration memory<br />
               rx    ><br />
               tx    X     ; Exit configuration mode<br />
              </pre>
          </div>
        </Col>
      </Row>
  )
  }
}

export class NotFoundErr extends React.Component {
  render() {
    return (<h1>Invalid step....</h1>)
  }
}

export class SetupGuide extends React.Component {
  steps(networks, activeNet) {
    return [
      {
        text: "Register an account",
        component: NotFoundErr,
        done: true
      },
      {
        text: "Create your first Network",
        component: SetupGuideCreateNetwork,
        active: (networks && networks.length == 0) || (activeNet && _.size(activeNet.devices) == 0),
        done: (activeNet && _.size(activeNet.devices) > 0) && (networks && networks.length > 1)
      },
      {
        text: "Connect to the Cloud",
        component: SetupGuideConnect,
        active: activeNet && _.size(activeNet.channels) == 0
      },
    ]
  }


  render() {
    let
      steps = this.steps(this.props.networks, this.props.network),
      colSize = Math.round(12 / steps.length),
      activeComp = (_.find(steps, 'active') || {}).component || NotFoundErr,
      child =  React.createElement(activeComp, this.props)

    return (
      <Grid fluid={true}>
        <Row className="bs-wizard" style={{borderBottom: 0}}>

          {_.map(steps, (step, k) => {
            let classNames = ''
            classNames += (step.active ? ' active' : '')
            classNames += (step.done ? ' complete' : (step.active ? '' : ' disabled'))

            return <Col
              key={k}
              xs={0 === k ? Math.round(colSize/2) : colSize}
              className={"bs-wizard-step" + classNames}
              >

              <div className="text-center bs-wizard-stepnum">{step.text}</div>
              <div className="progress"><div className="progress-bar"></div></div>
              <a href="#" className="bs-wizard-dot"></a>
            </Col>
          })}

        </Row>

        {child}
      </Grid>
    )
  }
}
