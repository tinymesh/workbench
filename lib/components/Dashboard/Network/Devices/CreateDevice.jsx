import React from 'react'
import Mixin from 'react-mixin'

import {Link} from 'react-router'
import {Row, Col, Input, Button, Glyphicon} from 'react-bootstrap'

import {LensedStateDefaultMixin} from '../../../../mixin'
import {DeviceStore, DeviceService} from '../../../../stores'

export class CreateDevice extends React.Component {
  constructor() {
    super()

    this._mounted = false
    this.state = {
      newDevice: {}
    }
  }

  componentDidMount() {
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false
  }

  addDevice(ev) {
    ev.preventDefault()

    DeviceService.create(this.props.params.nid, this.state.newDevice)
      .then(
        (resp) => {
          if (this.props.notify)
            this.props.notify.add(
              () =>
                <span>
                  <Glyphicon glyph="ok">&nbsp;</Glyphicon>
                  Device <Link
                    to="/dashboard/network/`${this.props.network.key}`/device/`${resp.data.key}`">
                    {resp.data.name || resp.data.key}
                  </Link> was created
                </span>,
              'success',
              {expire: 7500}
            )
        })
      .catch(
        (resp) => {
          let msg
          if (_.isError(resp)) {
            msg = resp.message
            console.log(resp.stack)
          } else
            msg = _.isObject(resp.data) ? (resp.data || {}).error : resp.data

          this._notify.add(
            <span> <Glyphicon glyph="warning-sign">&nbsp;</Glyphicon> Failed to create device: {msg}</span>,
            'danger',
            {clearOut: true}
          )
        })
  }

  render() {
    let network = this.props.network
    return (
      <Row>
        <form onSubmit={this.addDevice.bind(this)}>
          <Col xs={12}><h4>Create new device</h4></Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Input
              type="text"
              label="Name"
              valueLink={this.linkState('newDevice.name')}
              help="The name of your new device"
              />
          </Col>
          <Col xs={12} sm={6} md={4} lg={3}>
            <Input
              type="select"
              label="Type"
              valueLink={this.linkState('newDevice.type', network.provision.type)}
              help="The name of your new device"
            >
              {network.types.map( (type, idx) =>
                <option key={idx} value={type}>{type}</option> )}

            </Input>
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Input
              type="text"
              label="Address (UID)"
              valueLink={this.linkState('newDevice.address', null, parseInt)}
              help="The address of your new device"
              />
          </Col>

          <Col xs={12} sm={6} md={4} lg={3}>
            <Button
              onClick={this.addDevice.bind(this)}
              style={{marginTop: '23px'}}
              bsStyle="primary">

              <Glyphicon glyph="ok">&nbsp;</Glyphicon>
              Add Device
            </Button>
          </Col>
        </form>
      </Row>
    )
  }
}

Mixin(CreateDevice.prototype, LensedStateDefaultMixin)

