import React from 'react'
import {FormattedRelative, FormattedDate} from 'react-intl'
import _ from 'lodash'

import {AuthStore} from '../../Auth'
import {TokenStore, TokenService} from '../../Auth/Tokens'

import {Row, Col} from 'react-bootstrap'
import {PageHeader, Modal, Alert, Glyphicon} from 'react-bootstrap'
import {ListGroup, ListGroupItem} from 'react-bootstrap'
import {Input, ButtonToolbar, Button} from 'react-bootstrap'

import moment from 'moment'

export class Tokens extends React.Component {
  constructor() {
    super()

    this.state = {
      tokens: [],
      activeFilter: ['All', undefined],
      activeFilters: [['Active', (e) => undefined === e.revoked], ['Inactive', (e) => undefined !== e.revoked], ['All', undefined]],
      notify: null,
      addTokenModal: false,
      tokenExpires: null, // tag for expirey
      expireDate: null,   // The iso-8601 expirey date
      usageExpireInterval: -1,   // how much to increment expirey on usage, -1 for never
      extendExpirationOnUse: true,
      tokenName: ''
    }
  }
  componentWillMount() {
    this._mounted = true
    TokenStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({tokens: TokenStore.tokens})
    })

    TokenService.fetchTokens()

    this.state.tokenExpires = 'never'
    this.state.tokenName = ''
  }

  componentDidMount() {
    this.expires(this.state.tokenExpires || 'never') // make sure we patch the updates
  }

  componentWillUnmount() {
    this._mounted = false
    TokenStore.removeChangeListener(this._changeListener)
  }

  cycleActiveFilters() {
    this.setState( (prevState) => {
      let head = prevState.activeFilters.shift()
      prevState.activeFilters.push(head)
      return {
        activeFilter: head,
        activeFilters: prevState.activeFilters
      }
    })
  }

  expires(tag) {
    let date, expires, usage
    switch (tag) {
      case "never":
        expires = -1
        usage = -1;
        break

      case "day":
        date = moment().add(1, 'days')
        expires = date.toISOString()
        usage = moment().diff(date) * 1000
        break

      case "week":
        date = moment().add(1, 'week')
        expires = date.toISOString()
        usage = moment().diff(date) * 1000
        break

      case "month":
        date = moment().add(1, 'month')
        expires = date.toISOString()
        usage = moment().diff(date) * 1000
        break

      case "half-year":
        date = moment().add(6, 'months')
        expires = date.toISOString()
        usage = moment().diff(date) * 1000
        break

      case "year":
        date = moment().add(1, 'year')
        expires = date.toISOString()
        usage = moment().diff(date) * 1000
        break

      default:
        return
    }

    this.setState({
      tokenExpires: tag,
      expireDate: expires,
      usageExpireInterval: usage
    })
  }

  addToken() {
    let
      usage = this.state.extendExpirationOnUse && this.state.tokenExpires !== 'never' ? this.usageExpireInterval : -1,
      obj = {
        name: this.state.tokenName,
        expires: this.state.expireDate,
        usage_time: usage
      }

    TokenService.create(obj)
      .then((resp) => {
        this.setState({
          addTokenModal: false,
          notify:
            <Alert key="success" onDismiss={() => this.dismissNotification()} bsStyle="success" className="expand">
              The token <code>{resp.fingerprint}</code> was created!
            </Alert>})
      })
      .catch((resp) => {
        if (_.isError(resp)) {
          console.log("caught error", resp.message)
          console.log(resp.stack)
        } else
          err = resp.data.error || JSON.stringify(resp.data)

        return this.setState({
          notify:
            <Alert key="error" onDismiss={() => this.dismissNotification()} bsStyle="danger" className="expand">
              Failed to add new token: {resp.data.error || JSON.stringify(resp.data)}
            </Alert>})
      })
  }

  revokeToken(token, force) {
    TokenService.revoke(token.fingerprint, "user")
      .then((resp) =>
        this.setState({
          notify:
            <Alert key="success" onDismiss={() => this.dismissNotification()} bsStyle="success" className="expand">
              The token <code>{token.fingerprint}</code> was revoked
            </Alert>}))
      .catch((resp) => {
        let err
        if (_.isError(resp)) {
          console.log("caught error", resp.message)
          console.log(resp.stack)
        } else
          err = resp.data.error || JSON.stringify(resp.data)

        return this.setState({
          notify:
            <Alert key="error" onDismiss={() => this.dismissNotification()} bsStyle="danger" className="expand">
              Failed to revoke token <code>{token.fingerprint}</code>: {resp.data.error || JSON.stringify(resp.data)}
            </Alert>})
      })
  }

  dismissNotification() {
    this.setState({notify: null})
  }

  render() {
    let tokens = _.chain(this.state.tokens)
      .filter(this.state.activeFilter[1])
      .sortBy('meta.created')
      .reverse()
      .value()

    return (
      <div className="tokens tokens-tokens">
        {this.state.notify}

        <PageHeader>
          API Tokens
        </PageHeader>

        {0 === this.state.tokens.length && <Alert bsStyle="info">You have no tokens</Alert>}

        <Row>
          <Col xs={12} className="text-right">
            <ButtonToolbar style={{display: 'inline-block'}}>
              <Button onClick={(ev) => this.cycleActiveFilters()}>Active: {this.state.activeFilter[0]}</Button>
              <Button onClick={(ev) => this.setState({addTokenModal: true})} bsStyle="success">
                <Glyphicon glyph="plus">&nbsp;</Glyphicon>
                Add new token
              </Button>
            </ButtonToolbar>
          </Col>
        </Row>

        <ListGroup className="token-list">
          {_.map(tokens, (token, i) =>

            <ListGroupItem
              key={i}
              className="token">

              <span className="item fingerprint"><code>{token.fingerprint}</code></span>

              {token.name && <span className="item name">
                <span className="title">Name:</span> <strong className="name">{token.name}</strong>
              </span>}

              {!token.revoked && <span className="item created" title={token.meta.created}>
                <span className="title">Created:</span> <FormattedRelative value={token.meta.created} />
              </span>}

              {!token.revoked && <span className="item expires" title={token.expires}>
                <span className="title">Expires:</span> {-1 === token.expires ? 'Never' : <FormattedRelative value={token.expires} />}
              </span>}

              {!token.revoked && <span className="item used" title={token.meta.used}>
                <span className="title">Last Used:</span> {token.meta.used ? <FormattedRelative value={token.meta.used} /> : "never"}
              </span>}

              {token.revoked && <span className="item revoked-at" title={token.revoked.at}>
                <span className="title">Revoked:</span> <FormattedRelative value={token.revoked.at} />
              </span>}

              {token.revoked && <span className="item revoked-reason">
                <span className="title">Revocation Reason:</span> {token.revoked.reason}
              </span>}

              {!token.revoked &&
                <Button
                  onClick={(ev) => this.revokeToken(token)}
                  className="pull-right"
                  bsSize="small"
                  bsStyle="danger">

                  <Glyphicon glyph="remove">&nbsp;</Glyphicon>
                  Revoke
                </Button>}
            </ListGroupItem>
          )}

          {_.times(Math.max(0, 5 - tokens.length), (n) =>
            <ListGroupItem key={"dummy-" + n}>
              <span className="dummy-block">
                {_.times(32, () => " ")}
              </span>
              &nbsp; &nbsp; &nbsp;
              <span className="dummy-block">
                {_.times(12, () => " ")}
              </span>
            </ListGroupItem>)}


        </ListGroup>


        <Modal
          className="modal-confirm"
          show={this.state.addTokenModal}
          onHide={() => this.setState({addTokenModal: false})}>

          <Modal.Header>
            <Modal.Title>Add New Token</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Input
              type="text"
              label="Token Name"
              placeholder="Human identifiable name for key"
              value={this.state.tokenName}
              onChange={(ev) => this.setState({tokenName: ev.target.value})}
              />

            <div className="form-group">
              <label className="control-label"><span>Token Expires</span></label>
              <ButtonToolbar>
                <Button onClick={() => this.expires("never")}     bsStyle={this.state.tokenExpires === "never"     ? "success" : "default"}>Never</Button>
                <Button onClick={() => this.expires("day")}       bsStyle={this.state.tokenExpires === "day"       ? "success" : "default"}>1 Day</Button>
                <Button onClick={() => this.expires("week")}      bsStyle={this.state.tokenExpires === "week"      ? "success" : "default"}>1 Week</Button>
                <Button onClick={() => this.expires("month")}     bsStyle={this.state.tokenExpires === "month"     ? "success" : "default"}>1 Month</Button>
                <Button onClick={() => this.expires("half-year")} bsStyle={this.state.tokenExpires === "half-year" ? "success" : "default"}>6 Months</Button>
                <Button onClick={() => this.expires("year")}      bsStyle={this.state.tokenExpires === "year"      ? "success" : "default"}>12 Months</Button>
              </ButtonToolbar>

              <span className="help-block">
                <strong>Expires:</strong>&nbsp;
                {'never' === this.state.tokenExpires
                  ? 'Never'
                  : <FormattedDate value={this.state.expireDate} />
                }
              </span>
            </div>

            <Input
              type="checkbox"
              label="Extend expiration on usage"
              checked={this.state.extendExpirationOnUse}
              disabled={this.state.tokenExpires === 'never'}
              onChange={() => this.setState({extendExpirationOnUse: !this.state.extendExpirationOnUse})}
              />

          </Modal.Body>

          <Modal.Footer>
            <Button onClick={() => this.setState({addTokenModal: false})} bsStyle="link">Close</Button>
            <Button onClick={(ev) => this.addToken()} bsStyle="primary">Add Token</Button>
          </Modal.Footer>

        </Modal>
      </div>
    )
  }
}
