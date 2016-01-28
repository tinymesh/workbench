/**
 * Implementation of query using chunked transfer
 */

import {BASE_URL} from '../../Constants'
import {AuthStore} from '../../Auth'

import {EventEmitter} from 'events'

import jsonpipe from 'jsonpipe'


export class QueryStream extends EventEmitter {
  constructor(opts) {
    super()

    let url = BASE_URL + "/messages" + opts.uri
    url += '?query=' + window.encodeURI(opts.query)
    url += '&stream=true'
    url += '&continuous=' + (opts['continuous'] || "false")

    if (opts['date.from'])
    	url += '&date.from=' + (opts['date.from'] || "")

    if (opts['date.to'])
      url += '&date.to=' + (opts['date.to'] || "")


    this._req = jsonpipe.flow(url, {
      'success': (data) => this.emit('data', data),
      'error': (err) => this.emit('error', err),
      'complete': (status) => this.emit('complete', status),
      'method': 'GET',
      'withCredentials': false,
      'headers': {
         'Authorization': AuthStore.signV1("GET", url, "")
      }
    })
  }

  close() {
    this._req.abort()
  }
}
