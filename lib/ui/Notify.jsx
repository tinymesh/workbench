import {EventEmitter} from 'events'
import AppDispatcher from '../AppDispatcher'
import React from 'react'
import _ from 'lodash'

import {Alert} from 'react-bootstrap'

export class NotifyStore extends EventEmitter {
  constructor() {
    super()

    this._notifications = []
  }

  subscribe(subscription) {
    this._dispatchToken = AppDispatcher.register(subscription)
  }

  get dispatchToken() {
    return this._dispatchToken
  }

  emitChange() {
    this.emit('CHANGE')
  }

  addChangeListener(cb) {
    this.on('CHANGE', cb)
  }

  removeChangeListener(cb) {
    this.removeListener('CHANGE', cb)
  }

  get notifications() {
    return this._notifications
  }

  get clear() {
    this._notifications = []
    this.emitChange()
  }

  remove(ref) {
    this._notifications = _.filter(this.notifications, (note) => ref !== note.ref)
    this.emitChange()
  }

  add(message, style, opts) {
    this._notifications = []

    opts = opts || {}
    let
      ref = Math.random().toString(36).replace(/^0\./, ''),
      notifications = this._notifications

    if (opts.clearOut)
      notifications = []

    let prev = _.where(notifications, {message: message, style: style})

    if (prev.length > 0)
      return prev.ref

    notifications.push({message: message, style: style, ref: ref})

    this._notifications = notifications
    this.emitChange()

    if (opts.expire)
      setTimeout(() => this.remove(ref), opts.expire)

    return ref
  }
}

export class Notify extends React.Component {
  constructor() {
    super()
    this.state = {
      notifications: [],
    }
  }

  componentDidMount() {
    this.props.store.addChangeListener(this._listener = () => 
      this.setState({notifications: this.props.store.notification})
    )
  }

  componentWillUnmount() {
    this.props.store.removeChangeListener(this._listener)
  }

  render() {
    return (
      <div>
        {this.props.store.notifications.map( (note) =>
          <Alert key={note.ref} bsStyle={note.style}>
            {note.message}
          </Alert>
        )}
      </div>
    )
  }
}

Notify.Store = NotifyStore
