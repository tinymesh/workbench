import React from 'react'
import {FormattedRelative} from 'react-intl'
import _ from 'lodash'

import {AuthStore} from '../../Auth'
import {TokenStore, TokenService} from '../../Auth/Tokens'

import {Row, Col} from 'react-bootstrap'
import {PageHeader, ListGroup, ListGroupItem, Alert, ButtonToolbar, Button, Glyphicon} from 'react-bootstrap'

export class Sessions extends React.Component {
  constructor() {
    super()

    this.state = {
      sessions: [],
      activeFilter: ['All', undefined],
      activeFilters: [['Active', (e) => undefined === e.revoked], ['Inactive', (e) => undefined !== e.revoked], ['All', undefined]],
      notify: null
    }
  }
  componentWillMount() {
    this._mounted = true
    TokenStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({sessions: TokenStore.sessions})
    })

    TokenService.fetchSessions()
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

  revokeSession(session, force) {
    if (session.fingerprint === AuthStore.auth.fingerprint && !force) {
      this.setState({notify:
          <Alert key="info" onDismiss={() => this.dismissNotification()} bsStyle="warning" className="expand">
            Can't revoke the current session! To revoke it, do a normal logout instead.
          </Alert>})
      return
    }

    TokenService.revoke(session.fingerprint, "user")
      .then((resp) =>
        this.setState({notify:
            <Alert key="success" onDismiss={() => this.dismissNotification()} bsStyle="success" className="expand">
              The session <code>{session.fingerprint}</code> was revoked
            </Alert>}))
      .catch((resp) =>
        this.setState({notify:
            <Alert key="error" onDismiss={() => this.dismissNotification()} bsStyle="danger" className="expand">
              Failed to revoke session <code>{session.fingerprint}</code>: {resp.data.error || JSON.stringify(resp.data)}
            </Alert>}))
  }

  dismissNotification() {
    this.setState({notify: null})
  }

  render() {
    let myFingerprint = AuthStore.auth.fingerprint

    return (
      <div className="tokens tokens-session">
        {this.state.notify}

        <PageHeader>
          Sessions
        </PageHeader>

        {0 === this.state.sessions.length && <Alert bsStyle="info">You have no sessions</Alert>}


        <Row>
          <Col xs={12} className="text-right">
            <ButtonToolbar style={{display: 'inline-block'}}>
              <Button onClick={(ev) => this.cycleActiveFilters()}>Active: {this.state.activeFilter[0]}</Button>
            </ButtonToolbar>
          </Col>
        </Row>

        <ListGroup className="token-list">
          {_.chain(this.state.sessions)
              .filter(this.state.activeFilter[1])
              .sortBy('meta.created')
              .reverse()
              .map((session) =>

            <ListGroupItem
              bsStyle={myFingerprint === session.fingerprint ? 'info' : undefined}
              key={session.fingerprint}
              className="token">

              <span className="item fingerprint"><code>{session.fingerprint}</code></span>

              {session.name && <span><strong className="name">{session.name}</strong></span>}

              {!session.revoked && <span className="item created" title={session.meta.created}>
                <span className="title">Created:</span> <FormattedRelative value={session.meta.created} />
              </span>}

              {!session.revoked && <span className="item expires" title={session.expires}>
                <span className="title">Expires:</span> <FormattedRelative value={session.expires} />
              </span>}

              {!session.revoked && <span className="item used" title={session.meta.used}>
                <span className="title">Last Used:</span> {session.meta.used ? <FormattedRelative value={session.meta.used} /> : "never"}
              </span>}

              {session.revoked && <span className="item revoked-at" title={session.revoked.at}>
                <span className="title">Revoked:</span> <FormattedRelative value={session.revoked.at} />
              </span>}

              {session.revoked && <span className="item revoked-reason">
                <span className="title">Revocation Reason:</span> {session.revoked.reason}
              </span>}

              {!session.revoked &&
                <Button
                  onClick={(ev) => this.revokeSession(session)}
                  className="pull-right"
                  bsSize="small"
                  bsStyle="danger">

                  <Glyphicon glyph="remove">&nbsp;</Glyphicon>
                  Revoke
                </Button>}
            </ListGroupItem>
          ).value()}

          {_.times(Math.max(0, 7 - this.state.sessions.length), (n) =>
            <ListGroupItem key={"dummy-" + n}>
              <span className="dummy-block">
                {_.times(32 + Math.round(Math.random()), () => " ")}
              </span>
              &nbsp; &nbsp; &nbsp;
              <span className="dummy-block">
                {_.times(8 + Math.round(Math.random() * 10), () => " ")}
              </span>
            </ListGroupItem>)}
        </ListGroup>
      </div>
    )
  }
}
