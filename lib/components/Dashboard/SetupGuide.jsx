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

export class SetupGuideCreateNetwork extends React.Component {
  constructor() {
    super()

    this.state = {
      network: null,
      gateways: [],

      patch: {},

      newGWName: null,
      newGWAddr: null,

      confirm: null,
      confirmPromise: null
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

  resolveConfirm() {
    this.state.confirmPromise.resolve()

    this.clearConfirm()
  }

  clearConfirm() {
    console.log('hello confirm')
    this.setState({
      confirm: null,
      confirmPromise: null
    })
  }

  render() {
    return (
      <Row style={{marginTop: '50px'}}>
        <Col
          mdOffset={1} xs={12} sm={6} md={5} lg={3}
          style={{borderRight: '1px solid #eee', paddingRight: '6%'}}>

          <Modal
            className="modal-confirm"
            show={!!this.state.confirm}
            onHide={this.clearConfirm.bind(this)}>

            <Modal.Header>
              <Modal.Title>
                <Glyphicon glyph="ok">&nbsp;</Glyphicon>
                Confirm
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>{this.state.confirm}</Modal.Body>

            <Modal.Footer>
              <Button onClick={this.clearConfirm.bind(this)} bsStyle="link">Close</Button>
              <Button onClick={this.resolveConfirm.bind(this)} bsStyle="primary">Okey, got it!</Button>
            </Modal.Footer>
          </Modal>

          <div className="page-header">
            <h3>Create your first Network</h3>
          </div>

          <p className="lead">
            To get started with the Tiny Mesh cloud you need a network.
          </p>

          <p>
            Each network connects to one or more Tiny Mesh gateways and lets
            read date and send messages back to the network from the cloud.
          </p>
        </Col>

        <Col
          xs={10} sm={4}
          style={{marginTop: '7rem', marginLeft: '5%'}}
          className={null !== this.state.network ? 'collapse' : ''}>
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

        <Col smOffset={2} xs={10} sm={4} className={null === this.state.network ? 'collapse' : ''}>

          {this.state.gateways.length > 0 &&
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
          }

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
            <Col xs={2}>
              <label style={{display: 'block'}}>&nbsp;</label>
              <Button onClick={(ev) => this.addGateway(ev)}>Add</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

Mixin(SetupGuideCreateNetwork.prototype, LensedStateDefaultMixin)

export class SetupGuideConnect extends React.Component {
  render() {
    return (<h1>Connect to Cloud</h1>)
  }
}

export class NotFoundErr extends React.Component {
  render() {
    return (<h1>Invalid step....</h1>)
  }
}

export class SetupGuide extends React.Component {
  constructor() {
    super()

    this.state = {
      networks: [],
      newGateways: []
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

  steps() {
    return [
      {
        text: "Register an account",
        component: SetupGuideConnect,
        done: true
      },
      {
        text: "Create your first Network",
        component: SetupGuideCreateNetwork,
        active: true,
        done: this.state.networks.length > 0
      },
      {
        text: "Connect to the Cloud",
        component: SetupGuideConnect,
        active: this.state.networks.length > 0
      },
    ]
  }


  render() {
    let
      steps = this.steps(),
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
