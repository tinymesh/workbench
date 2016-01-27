import {BASE_URL} from './Constants'
import {AuthStore} from './Auth'

import {EventEmitter} from 'events'


export class SSE extends EventEmitter {
  constructor(url, opts) {
    super()

    this.setMaxListeners(0)

    this._sse = new EventSource(url)

    this._sse.onerror   = (e) => (this.listeners("error").length > 0 && this.emit("error", e))
    this._sse.onmessage = (e) => (this.listeners("message").length > 0 && this.emit("message", e))
  }

  close() {
    console.log("close stream")
    this._sse.close()
  }

  isOpen() {
    return this._sse.readyState === this._sse.OPEN
  }

  on(type, target) {
    this._sse.addEventListener(type, target)

    this.prototype.on.apply(this, arguments)
  }

  removeListener(ev, fn) {
    this._sse.removeEventListener(ev, fn)
    this.prototype.removeListener.apply(this, arguments)
  }

  _listener(ev) {
    console.log("_listener", ev)
    try {
      this.emit(ev, JSON.parse(ev.data))
    } catch(e) {
      this.emit("error", e);
    }
  }
}

export class Stream extends EventEmitter {
  constructor(spec, opts) {
    super()

    let url = BASE_URL + "/stream?query=" + window.encodeURI(spec) + "&accept=*/*"
    let sig = AuthStore.signV1("GET", url, "")

    url += "&authorization=" + sig

    this.setMaxListeners(0)

    this._sse = new EventSource(url)

    this._sse.onerror = (ev) => this.emit("error", ev);
    this._sse.onmessage = (ev) => this.emit("message", ev)

    this._registered = []

    let chans = _.each(spec.split(";"), (spec) => {
      let type = spec.split(/(\/|:|->)/)[0]
      this.addEventMapping(type)
    })
  }

  addEventMapping(type) {
    if (type in this._registered)
      return

    this._sse.addEventListener(type, (ev) => {
      try {
        this.emit(type, JSON.parse(ev.data))
      } catch(e) {
        this.emit("error", e);
      }
    })
  }

  close() {
    console.log("close stream")
    this._sse.close()
  }

  isOpen() {
    return this._sse.readyState === this._sse.OPEN
  }

  removeListener(ev, fn) {
    this._sse.removeEventListener(ev, fn)
    this.prototype.removeListener.apply(this, arguments)
  }
}
