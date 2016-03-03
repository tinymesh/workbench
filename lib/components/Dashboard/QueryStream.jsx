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

    let handleReqErr = function(err) {
      let data = err || this._req.responseText

      try {
         data = JSON.parse(data)
      } catch (e) { }

      this.emit('error', err, this._req)

    }.bind(this)

    let headers = {
      'Authorization': AuthStore.signV1("GET", url, "")
    }

    let enc
    if (enc = opts['data-encoding'] || opts['data.encoding'] || opts['x-data-encoding'])
      headers['X-Data-Encoding'] = enc

    this._req = jsonpipe.flow(url, {
      'success': (data, req) => {
         let proto = data['proto/tm']

         if (!proto)
            return

         switch (this._req.getResponseHeader('x-data-encoding')) {
            case 'base64':
               if (proto.detail == 'serial' || proto.command == 'serial')
                  proto.data = (new Buffer(proto.data, 'base64')).toString()
               break

            case 'hex':
               if (proto.detail == 'serial' || proto.command == 'serial')
                  proto.data = (new Buffer(proto.data, 'hex')).toString()
               break

            case 'binary':
               break

            default:
               console.log('ERROR! unsuported data-encoding ' + this._req.getResponseHeader('x-data-encoding'))
               return
               break
         }

         this.emit('data', data)
      },
      'error': handleReqErr,
      'complete': (status) => this.emit('complete', status),
      'method': 'GET',
      'withCredentials': false,
      'headers': headers
    })

    this._req.onabort = () => this.emit('abort')
    this._req.onload = () => this.emit('load')
  }

  close() {
    this._req.abort()
  }
}
