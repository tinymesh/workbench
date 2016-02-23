import React from 'react'
import _ from 'lodash'

import {Row, Col, Nav, NavItem} from 'react-bootstrap'
import {Button, Input} from 'react-bootstrap'

import Toggle from 'react-toggle'

import {Notify, Loading} from '../../ui'
import {TinymeshProto} from '../../TinymeshProto.jsx'
import {parseData, asAscii, asBin, asHex} from './Device/SerialConsole.jsx'

import axios from 'axios'
import {BASE_URL} from '../../Constants.js'
import {AuthStore} from '../../Auth'

export class SendMsg extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         pathSuffix: '',
         command: null
      }
   }

   componentWillMount() {
      this._mounted = true
      this._notify = new Notify.Store()

      let {nid, key} = this.props.params

      if (key)
         this.state.pathSuffix = '/message/' + nid + '/' + key
      else if (network)
         this.state.pathSuffix = '/message/' + nid
   }

   componentWillUnmount() {
      this._mounted = false
   }

   componentWillReceiveProps(nextProps) {
      let {nid, key} = this.props.params

      if (key)
         this.setState({pathSuffix: '/message/' + nid + '/' + key})
      else if (network)
         this.setState({pathSuffix: '/message/' + nid})
   }

   render() {
      let {pathSuffix} = this.state
      let commands = TinymeshProto.commands
      let command =  this.state.command ||_.keys(commands)[0]
      let packet = commands[command]
      let l10n = {
         'set_output':      { name: 'Set Output' },
         'set_pwm':         { name: 'Set PWM' },
         'serial':          { name: 'Send UART data' },
         'init_gw_config':  { name: 'Set Gateway in Config Mode' },
         'get_nid':         { name: 'Get NID' },
         'get_status':      { name: 'Get Status' },
         'get_did_status':  { name: 'Get DID Status' },
         'get_config':      { name: 'Get Configuration' },
         'get_calibration': { name: 'Get Calibration' },
         'force_reset':     { name: 'Force Router Reset' },
         'get_path':        { name: 'Get Packet Path' },
      }

      return (
         <Row className="send-msg">
            <b>SUFFIX: {pathSuffix}</b>
            <Col xs={4} md={3} className="aside">

               <Nav
                  onSelect={(k) => this.setState({command: k})}
                  bsStyle="pills"
                  activeKey={command}
                  stacked>

                  {_.map(commands, (v, idx) => <NavItem eventKey={idx} key={idx}>{l10n[idx].name || idx}</NavItem>)}
               </Nav>
            </Col>

            <Col xs={8} md={9} className="main">
               {(packet && TinymeshProto.types.GENERIC     === packet.type) && <GenericMsg packet={packet} pathSuffix={pathSuffix} command={command} {...this.props} />}
               {(packet && undefined === packet.type)                       && <GenericMsg packet={packet} pathSuffix={pathSuffix} command={command} {...this.props} />}
               {(packet && TinymeshProto.types.SET_OUTPUT  === packet.type) && <OutputMsg  packet={packet} pathSuffix={pathSuffix} command={command} {...this.props} />}
               {(packet && TinymeshProto.types.SET_PWM     === packet.type) && <PWMMsg     packet={packet} pathSuffix={pathSuffix} command={command} {...this.props} />}
               {(packet && TinymeshProto.types.SEND_SERIAL === packet.type) && <SerialMsg  packet={packet} pathSuffix={pathSuffix} command={command} {...this.props} />}
               {!packet && <NoSuchCommand />}
            </Col>
         </Row>
      )
   }
}


let handleACK = function(ev) {
   this.setState({
      ack: ev.target.checked
   })
}


let handleCMDnum = function(ev) {
   ev.preventDefault()

   if (!ev.target.value)
      return this.setState({cmd_number: undefined})

   let num = parseInt(ev.target.value)
   if (NaN === num)
      undefined
   else
      this.setState({cmd_number: num})
}

let sendData = function(command, payload, resource) {
   payload.type = 'command'
   payload.command = command

   let
      buf = JSON.stringify({'proto/tm': payload}),
		url = BASE_URL + resource,
		headers = {
			'Authorization': AuthStore.signV1('POST', url, buf),
			'Content-Type':  'application/json'
		}

	return axios.post(url, buf, {headers})
}


class NoSuchCommand extends React.Component {
   render() {
      return (
         <h1>No such command</h1>
      )
   }
}


class OutputMsg extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         gpio: {},
         ack: false,
         cmd_number: undefined,
         loading: false
      }

      this.handleCMDnum = handleCMDnum.bind(this)
      this.handleACK = handleACK.bind(this)
      this.sendData = function() {
         let data = {'gpio': this.state.gpio}

         if (this.state.cmd_number)
            data.cmd_number = this.state.cmd_number

         this.setState({loading: true})

         return sendData('set_output', data, this.props.pathSuffix)
                  .then(() => this.setState({loading: false}))
                  .catch(() => this.setState({loading: false}))
      }.bind(this)
   }

   handleChange(ev, gpio) {
      ev.preventDefault()

      let patch = {gpio: this.state.gpio}

      if (false === this.state.gpio['gpio_' + gpio] && true === ev.target.checked)
         delete patch.gpio['gpio_' + gpio]
      else if(true === ev.target.checked)
         patch.gpio['gpio_' + gpio] = true
      else
         patch.gpio['gpio_' + gpio] = false

      this.setState(patch)
   }

   render() {
      let {packet} = this.props
      let {ack, cmd_number} = this.state

      let
         min = !ack ? 0 : 128,
         max = !ack ? 127 : 255,
         valid = undefined === cmd_number || (cmd_number >= min && cmd_number <= max)

      return (
         <Loading loading={this.state.loading}>
            <div>
               <Row>
                  {packet.comment && <p className="mute muted" dangerouslySetInnerHTML={{'__html': packet.comment}} />}
                  <hr />
               </Row>

               <Row>
                  {_.map([0,3,6,1,4,7,2,5], (idx) => {
                     return <Col xs={4} key={idx} className={undefined === this.state.gpio['gpio_' + idx] && 'toggle-untouched' || ''}>
                        <label>
                           <Toggle
                              checked={this.state.gpio['gpio_' + idx]}
                              onChange={(ev) => this.handleChange(ev, idx)} />
                           <span>GPIO {idx}</span>
                        </label>
                     </Col>
                  })}
               </Row>

               <Row>
                  <Col xs={12}>
                     <hr />

                     <Col xs={2} className="pull-right">
                        <Button
                           className="pull-right"
                           onClick={this.sendData}
                           disabled={!valid}>Send message</Button>
                     </Col>

                     <Col xs={3} className="pull-right">
                        <label className="pull-right">
                           <Input type="checkbox" onChange={this.handleACK} />
                           <span>Request command <code>`ACK`</code></span>
                        </label>
                     </Col>

                     <Col className="pull-right" xs={2} style={{position: "relative"}}>
                        <Input
                           type="number"
                           placeholder="CMD number"
                           min={ack ? 0 : 128}
                           max={ack ? 127 : 255}
                           onChange={this.handleCMDnum} />

                        {!valid && <div style={{width: '300%', background: 'transparent'}} className="alert-danger">
                           The Command number should be in the range <code>{min}..{max}</code>.<br />
                           The valid range depends whetever you use ACK or not.
                        </div>}
                     </Col>

                  </Col>
               </Row>
            </div>
         </Loading>
      )
   }
}

class PWMMsg extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         gpio: {},
         ack: false,
         cmd_number: undefined,
         pwm: 0
      }

      this.handleCMDnum = handleCMDnum.bind(this)
      this.handleACK = handleACK.bind(this)
      this.handleChange = this.handleChange.bind(this)

      this.sendData = function() {
         let data = {'pwm': this.state.pwm}

         if (this.state.cmd_number)
            data.cmd_number = this.state.cmd_number

         this.setState({loading: true})

         return sendData('set_pwm', data, this.props.pathSuffix)
                  .then(() => this.setState({loading: false}))
                  .catch(() => this.setState({loading: false}))
      }.bind(this)
   }

   handleChange(ev) {
      this.setState({pwm: parseInt(ev.target.value)})
   }

   render() {
      let {packet} = this.props
      let {ack, cmd_number, pwm} = this.state

      let
         min = !ack ? 0 : 128,
         max = !ack ? 127 : 255,
         valid = undefined === cmd_number || (cmd_number >= min && cmd_number <= max)

      return (
         <div>
            <Row>
               <Col xs={12}>
                  {packet.comment && <p className="mute muted" dangerouslySetInnerHTML={{'__html': packet.comment}} />}
               <hr />
               </Col>
            </Row>

            <Row>
               <Col xs={6}>
                  <Input
                     type="range"
                     label="PWM Effect"
                     value={pwm}
                     onChange={this.handleChange}
                     addonAfter={pwm + "%"} />
               </Col>
            </Row>

            <Row>
               <Col xs={12}>
                  <hr />

                  <Col xs={2} className="pull-right">
                     <Button
                        className="pull-right"
                        onClick={this.sendData}
                        disabled={!valid}>Send message</Button>
                  </Col>

                  <Col xs={3} className="pull-right">
                     <label className="pull-right">
                        <Input type="checkbox" onChange={this.handleACK} />
                        <span>Request command <code>`ACK`</code></span>
                     </label>
                  </Col>

                  <Col className="pull-right" xs={2} style={{position: "relative"}}>
                     <Input
                        type="number"
                        placeholder="CMD number"
                        min={ack ? 0 : 128}
                        max={ack ? 127 : 255}
                        onChange={this.handleCMDnum} />

                     {!valid && <div style={{width: '300%', background: 'transparent'}} className="alert-danger">
                        The Command number should be in the range <code>{min}..{max}</code>.<br />
                        The valid range depends whetever you use ACK or not.
                     </div>}
                  </Col>

               </Col>
            </Row>
         </div>
      )
   }
}

class GenericMsg extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         gpio: {},
         ack: false,
         cmd_number: undefined
      }

      this.handleCMDnum = handleCMDnum.bind(this)
      this.handleACK = handleACK.bind(this)

      this.sendData = function() {
         let data = {}

         if (this.state.cmd_number)
            data.cmd_number = this.state.cmd_number

         this.setState({loading: true})

         return sendData(this.props.command, data, this.props.pathSuffix)
                  .then(() => this.setState({loading: false}))
                  .catch(() => this.setState({loading: false}))
      }.bind(this)
   }

   render() {
      let {packet} = this.props
      let {ack, cmd_number} = this.state

      let
         min = !ack ? 0 : 128,
         max = !ack ? 127 : 255,
         valid = undefined === cmd_number || (cmd_number >= min && cmd_number <= max)

      return (
         <div>
            <Row>
               {packet.comment && <p className="mute muted" dangerouslySetInnerHTML={{'__html': packet.comment}} />}
               <hr />
            </Row>

            <Row>
               <Col xs={12}>
                  <Col xs={2} className="pull-right">
                     <Button
                        className="pull-right"
                        onClick={this.sendData}
                        disabled={!valid}>Send message</Button>
                  </Col>

                  <Col xs={3} className="pull-right">
                     <label className="pull-right">
                        <Input type="checkbox" onChange={this.handleACK} />
                        <span>Request command <code>`ACK`</code></span>
                     </label>
                  </Col>

                  <Col className="pull-right" xs={2} style={{position: "relative"}}>
                     <Input
                        type="number"
                        placeholder="CMD number"
                        min={ack ? 0 : 128}
                        max={ack ? 127 : 255}
                        onChange={this.handleCMDnum} />

                     {!valid && <div style={{width: '300%', background: 'transparent'}} className="alert-danger">
                        The Command number should be in the range <code>{min}..{max}</code>.<br />
                        The valid range depends whetever you use ACK or not.
                     </div>}
                  </Col>

               </Col>
            </Row>
         </div>
      )
   }
}

class SerialMsg extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         gpio: {},
         ack: false,
         cmd_number: undefined,
         input: "",
         parsed: null
      }

      this.handleCMDnum = handleCMDnum.bind(this)
      this.handleACK = handleACK.bind(this)
      this.handleChange = this.handleChange.bind(this)

      this.sendData = function() {
         let data = {data: btoa(this.state.parsed)}

         if (this.state.cmd_number)
            data.cmd_number = this.state.cmd_number

         this.setState({loading: true})

         return sendData('serial', data, this.props.pathSuffix)
                  .then(() => this.setState({loading: false}))
                  .catch(() => this.setState({loading: false}))
      }.bind(this)
   }

   handleChange(ev) {
      let ret = parseData(ev.target.value)

      if (ret.error)
         this.setState({input: ev.target.value, parsed: ret})
      else
         this.setState({input: ev.target.value, parsed: ret.toString()})
   }

   render() {
      let {packet} = this.props
      let {ack, cmd_number, parsed} = this.state

      let
         min = !ack ? 0 : 128,
         max = !ack ? 127 : 255,
         valid = undefined === cmd_number || (cmd_number >= min && cmd_number <= max)


      return (
         <div>
            <Row>
               {packet.comment && <p className="mute muted" dangerouslySetInnerHTML={{'__html': packet.comment}} />}
               <hr />
            </Row>

            <Row>
               <Input
                  type="textarea"
                  value={this.state.input}
                  onChange={this.handleChange} />

               {(_.isObject(parsed) && parsed.error) && <div style={{width: '300%', background: 'transparent'}} className="alert-danger">
                  <b>Error</b>: {parsed.error}
               </div>}
            </Row>

            <Row>
               <Col xs={12}>
                  <hr />

                  <Col xs={2} className="pull-right">
                     <Button
                        className="pull-right"
                        onClick={this.sendData}
                        disabled={!valid}>Send message</Button>
                  </Col>

                  <Col xs={3} className="pull-right">
                     <label className="pull-right">
                        <Input type="checkbox" onChange={this.handleACK} />
                        <span>Request command <code>`ACK`</code></span>
                     </label>
                  </Col>

                  <Col className="pull-right" xs={2} style={{position: "relative"}}>
                     <Input
                        type="number"
                        placeholder="CMD number"
                        min={ack ? 0 : 128}
                        max={ack ? 127 : 255}
                        onChange={this.handleCMDnum} />

                     {!valid && <div style={{width: '300%', background: 'transparent'}} className="alert-danger">
                        The Command number should be in the range <code>{min}..{max}</code>.<br />
                        The valid range depends whetever you use ACK or not.
                     </div>}
                  </Col>

               </Col>
            </Row>
         </div>
      )
   }
}
