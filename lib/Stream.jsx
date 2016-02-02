import {BASE_URL} from './Constants'
import {AuthStore} from './Auth'

import {EventEmitter} from 'events'

export class Stream extends EventEmitter {
  constructor(spec, opts) {
    super()

    let url = BASE_URL + "/stream?query=" + window.encodeURI(spec) + "&accept=*/*"
    let sig = AuthStore.signV1("GET", url, "")

    url += "&authorization=" + sig

    this.setMaxListeners(0)

    this._sse = new EventSource(url)

    this._sse.onerror = (ev) => this.emit("error", ev);

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
