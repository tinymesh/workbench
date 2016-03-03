import React from 'react'
import {Buffer} from 'buffer'
import _ from 'lodash'

import axios from 'axios'
import {BASE_URL} from '../../../Constants.js'
import {AuthStore} from '../../../Auth'

import {Terminal} from '../../../ui'
import {QueryStream} from '../QueryStream.jsx'

import {formatters, parse} from './SerialConsole.Utils.jsx'

import {Label} from 'react-bootstrap'


let usage = `
usage: "string" | [ 1 10 100 255 ] | < 00 1a ff >, type help for more info
`

let help = `
Online terminal emulator

This terminal enables you to communicate with the serial port of a
Tinymesh device. Each payload will be packed as a Tinymesh packet and
sent to the device. The terminal supports the following formats:

 1. "quoted string" - sends an ascii string
 2. [0, 1, 2, 3, 4] - sends a byte array each item is a decimal
 3. <01 ab cd ff>   - sends a byte array each item is a hex number
 4. "trigger" <0a>  - combine any of the above

Commands:
  - help          - shows this text
  - usage         - shows usage
  - send \`data\`   - send data to device
  - output \`mode\` - switch between output modes (hex, bytes, ascii)

`

//let shipData = function(buf, params) {
//   console.log(buf, params)
//   let
//      payload = JSON.stringify({'proto/tm': {'type': 'command', 'command': 'serial', 'data': buf.toString()}}),
//      url = BASE_URL + '/message/' + params.nid + '/' + params.key,
//      headers = {
//         'Authorization': AuthStore.signV0('POST', url, payload),
//         'Content-Type':  'application/json',
//      }
//
//   axios.post(url, payload, {headers})
//
//   return buf
//}
//
//let
//   handle = function(input) {
//      let head, p, command, trimmed
//
//      let input2 = _.trimLeft(input)
//      trimmed = input.length - input2.length // preserve spaces for pos
//
//      head = input2[0]
//
//      command = (input2.split(/ /) || [])
//
//      if (!pairs[head] && !commands[command[0]]) {
//        p = _.map(pairs, (t) => "`" + t + "`").join(', ')
//        return {error: "expected a command OR one of " + p + '. Got `' + head + '`', pos: trimmed}
//      } else if (commands[command[0]]) {
//        trimmed += command[0].length + 1
//        return commands[command[0]](command.slice(1), trimmed, this.params)
//      } else {
//        return commands["send"](input2, trimmed, this.params)
//      }
//   }

class Cycle extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         pos: 0
      }

      this.handleClick = this.handleClick.bind(this)
   }

   handleClick() {
      let {items, onSelect} = this.props

      this.setState( state => state.pos++,
                     () => {
                        if (onSelect) {
                           let {pos} = this.state
                           onSelect(items[pos % items.length])
                        }
                     } )

   }

   render() {
      let
         {items} = this.props,
         {pos} = this.state

      return (
         <Label
            onClick={this.handleClick}
            bsStyle="success">

            {items[pos % items.length]}
         </Label>
      )
   }
}

export class SerialConsole extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         stream: null,
         newLines: null,
         output: "hex",
      }

      this.formatter = this.formatter.bind(this)
      this.sendData = this.sendData.bind(this)
      this.handleInput = this.handleInput.bind(this)
   }

   componentWillMount() {
      let {nid, key} = this.props.params

      this.runQuery(nid, key)
   }

   runQuery(nid, key) {
      if (this.state.stream)
         throw("A query is already running. Make sure it's closed")

      let res = new QueryStream({
         'date.from':  'NOW//-24HOUR',
         'continuous': "true",
         'query':      '',
         'uri':        '/' + nid + '/' + key,
      })

      res.on('error',     (err) => {
         if (!err && this.state.stream)
            this.state.stream && this.state.stream.close()
      })

      res.on('complete',  () => this.setState({stream: null}))

      res.on('data',      (data) => {
         // skip initial return
         if ('ping' === data || !data['proto/tm'])
            return

         if (data['proto/tm'].detail == 'serial' || data['proto/tm'].command == 'serial') {
            data['proto/tm'].data = new Buffer(data['proto/tm'].data)
            this.setState({newLines: [data]})
         }
      })

      this.setState({stream: res})
   }

   componentDidMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false

      if (this.state.stream)
         this.state.stream.close()
   }

   formatter(line) {
      return formatters.serial(line, this.state.output)
   }

   commands() {
      return {
         "usage": () => usage,
         "help":  () => help,

         "send":  (input, trimmed, p) => {
            let res = parse(input, trimmed)

            return Buffer.isBuffer(res) ? this.sendData(res, p) : res
         },

         "output": function(mode) {
            mode = mode[0]
            if ('hex' === mode || 'ascii' === mode || 'bytes' === mode)
               return "Switched from `oldmode` to `" + mode + "`"

            return {error: "Invalid output mode: `" + mode + "`\nusage: output <hex | ascii | bytes>"}
         }
      }
   }

   sendData(buf, params) {
      let
         payload = JSON.stringify({'proto/tm': {'type': 'command', 'command': 'serial', 'data': buf.toString()}}),
         url = BASE_URL + '/message/' + params.nid + '/' + params.key,
         headers = {
            'Authorization': AuthStore.signV1('POST', url, payload),
            'Content-Type':  'application/json',
         }

      axios.post(url, payload, {headers})

      return ""
   }

   handleInput(input) {
      let
         {params} = this.props,
         head, p, command, trimmed

      let input2 = _.trimLeft(input)
      trimmed = input.length - input2.length // preserve padding for pos

      head = input2[0]
      command = input2.split(/ /) || []

      if (undefined === command[0])
         return
      else if (command[0].match(/^[\[<"'>\]]/))
         return this.commands()['send'](input2, trimmed, params)
      else if (this.commands()[command[0]]) {
         trimmed += command[0].length + 1
         return this.commands()[command[0]]( command.slice(1), trimmed, params )
      } else
         return {error: "No such command `" + command[0] + "`. try calling `help`"}
   }

   render() {
      let {output} = this.state

      let label = <Cycle
         items={["hex", "ascii", "bytes"]}
         onSelect={v => this.setState({output: v})}
         />

      return <Terminal
         className="row"
         body={[usage]}
         formatter={this.formatter}
         newLines={this.state.newLines}
         labels={["Serial Mode", label]}
         onInput={this.handleInput}
         {...this.props} />
   }
}
