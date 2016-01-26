import React from 'react'
import Mixin from 'react-mixin'
import {LensedStateDefaultMixin} from '../../../mixin'

import {Link} from 'react-router'
import {Row, Col, PageHeader, Alert} from 'react-bootstrap'
import {Input, Button, Label} from 'react-bootstrap'
import {Glyphicon, ListGroup, ListGroupItem} from 'react-bootstrap'
import {FormattedRelative, FormattedDate} from 'react-intl'


import {AddressEncoder, Loading, Notify} from '../../../ui'
import {AuthStore} from '../../../Auth'
import {NetworkStore, NetworkService} from '../../../stores/Network'

export class Overview extends React.Component {
  constructor() {
    super()

    this._notify = null
    this._mounted = false
    this.state = {
      patch: {},

      newType: ""
    }

  }

  componentWillMount() {
    this._mounted = true
    this._notify = new Notify.Store()
  }

  componentWillUnmount() {
    this._mounted = false
    this._notify = null
  }

  validateType() {
    if (!this.state.newType || this.state.newType.match(/^[a-zA-Z0-9_-]*$/))
      return
    else
      return 'danger'
  }

  removeType(ev, type) {
    ev.preventDefault()

    if ('gateway' === type) {
      alert("you can't delete the `Gateway` type")
      return
    }

    this.setState((prevState) => {
      let newTypes = _.without((prevState.patch.types || this.props.network.types), type)
      return {
        patch: _.set(prevState.patch || {}, 'types', newTypes)
      }
    })
  }

  addType(ev) {
    ev.preventDefault()

    if (undefined !== this.validateType() || !this.state.newType)
      return

    this.setState((prevState) => {
      let newTypes = (prevState.patch.types || this.props.network.types).concat([this.state.newType])
      return {
        patch: _.set(prevState.patch || {}, 'types', _.uniq(newTypes)),
        newType: ""
      }
    })
  }

  handleKeyDownEnter(ev, callback) {
    var ENTER = 13;
    if( ev.keyCode == ENTER )
        callback && callback.call(this, ev)
  }

  updateNetwork(ev) {
    NetworkService.update(this.props.network.key, this.state.patch)
      .then(
        (resp) => {
          this.setState({patch: {}})
          this._notify.add(
            <span> <Glyphicon glyph="ok" /> Network was updated!  </span>,
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
            <span> <Glyphicon glyph="warning-sign">&nbsp;</Glyphicon> Failed to update network: {msg}</span>,
            'danger',
            {clearOut: true}
          )
        })
  }

  render() {
    let
      network = this.props.network,
      patch = this.state.patch,
      auth = AuthStore.auth.owner,
      parentLink = (parent) => {
        if (parent === auth)
          return <a>You</a>
        else if(parent.match(/^organization\//))
          return <Link to={parent}>{parent} (@todo OrgStore)</Link>
        else
          return <span>{parent.replace(/^[^/]*\//, '')}</span>
      }

    let typeState = (type) => {
      let
        inNet   = -1 != _.indexOf(network.types, type),
        inPatch = -1 != _.indexOf(patch.types, type)


      if (!inNet && inPatch)
        return "success"

      if (patch.types && (inNet && !inPatch))
        return "danger"

      if (!patch.types || (inNet && inPatch))
        return undefined

    }

    return (
      <Loading loading={!this.props.network}>
        {null !== network && <form onSubmit={this.updateNetwork.bind(this)}>

          <Notify store={this._notify} />

          <Row className="overview section main">
            <Col xs={12}>

              <div className="meta pull-right">
                <span className="created">
                  <span className="name">Created:</span>&nbsp;
                  <span className="item updated" title={network.meta.created}>
                    <FormattedRelative value={network.meta.created} />
                  </span>
                </span>
                <br />

                <span className="last-update">
                  <span className="name">Updated:</span>&nbsp;
                  <span className="item updated" title={network.meta.updated}>
                    <FormattedRelative value={network.meta.updated} />
                  </span>
                </span>
              </div>

              <h2>{network.name || "Unnamed network"}</h2>
              <hr />
            </Col>
            <Col xs={12} md={6} lg={5}>
              <Input
                type="text"
                valueLink={this.linkState('patch.name', network.name)}
                label="Network Name"
                help="A human readable name for your network"
                />

              <Input
                type="text"
                value={AddressEncoder.encode(network.address)}
                label="Network ID (NID)"
                help="The address of the Tiny Mesh Network"
                disabled
                />

              <div className="access">
                <strong>Access Rights: </strong>
                {network.parents.map( (parent, idx) =>
                  <Label key={idx} bsStyle="default">{parentLink(parent)}</Label> )}
              </div>
            </Col>
          </Row>

          <Row className="config section">
            <Col xs={12} md={6} lg={3} className="types">
              <h4>Network Types</h4>

              <ListGroup>
                {_.uniq(((patch || {}).types || []).concat(network.types)).map( (type, idx) =>
                  <ListGroupItem
                    bsStyle={typeState(type)}
                    key={idx}>

                    {type}
                    <Button
                      className="pull-right"
                      bsStyle="danger"
                      bsSize="small"
                      style={{marginTop: '-6px'}}
                      onClick={(ev) => this.removeType(ev, type)}
                      title="Remove Type">

                      <Glyphicon glyph="remove" />
                    </Button>
                  </ListGroupItem>
                )}
              </ListGroup>

              <Row>
                  <Col xs={9}>
                    <Input
                      addonBefore="New Type"
                      type="text"
                      bsStyle={this.validateType()}
                      onKeyDown={(ev) => this.handleKeyDownEnter(ev, this.addType)}
                      valueLink={this.linkState('newType')}
                      />
                  </Col>

                  <Col xs={3}>
                    <Button
                      bsStyle="primary"
                      bsSize="small"
                      title="Add New Type"
                      onClick={this.addType.bind(this)}>

                      <Glyphicon glyph="plus">&nbsp;</Glyphicon>
                      Add
                    </Button>
                  </Col>
              </Row>
           </Col>

            <Col xs={12} md={6} lg={3} className="channels">
              <h4>Connection Channels</h4>

              <blockquote>Disabled.. this feature will be added soon</blockquote>
            </Col>

            <Col xs={6} md={6} lg={3} className="provisioning">
              <h4>Provisioning</h4>

              <Input
                type="select"
                label="Default Device State"
                valueLink={this.linkState('patch.provision.default', network.provision.default)}
                help=<span>Default state of new devices, use <code>Disabled</code> to disable auto-provisioning</span>
                placeholder="select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="disable">Disabled</option>
              </Input>

              <Input
                type="select"
                label="Default Device Type"
                valueLink={this.linkState('patch.provision.type', network.provision.type)}
                help="The default device type to use when creating devices"
                placeholder="select">
                {(patch.types || network.types).map( (val, k) =>
                  <option key={k} value={val}>{val}</option>
                )}
              </Input>
            </Col>

            <Col xs={6} md={6} lg={3} className="groups">
              <h4>Groups</h4>

              <blockquote>Disabled.. this feature will be added soon</blockquote>
            </Col>
          </Row>

          <Row
            style={{background: 'white', borderTop: '1px solid #ccc'}}
            className={"static bottom " + (0 === _.size(patch) ? 'collapse' : '')}
            >
            <Col xs={12}>
              <Button type="submit" bsStyle="primary">Update network</Button>
              <Button type="reset" bsStyle="link">Reset</Button>
            </Col>
          </Row>
        </form> || ""}
      </Loading>
    )
  }
}

Mixin(Overview.prototype, LensedStateDefaultMixin)
