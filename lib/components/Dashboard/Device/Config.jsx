import React from 'react'
import Mixin from 'react-mixin'
import _ from 'lodash'

import Spinner from 'react-spinkit'
import {Row, Col} from 'react-bootstrap'
import {Input, FormControls, Button, Modal, Glyphicon} from 'react-bootstrap'
import {Nav, NavItem} from 'react-bootstrap'

import {Loading} from '../../../ui'

import axios from 'axios'

import {AuthStore} from '../../../Auth'
import {BASE_URL} from '../../../Constants.js'

import _unset from 'lodash.unset'

class ConfigInputRange extends React.Component {
   render() {
      let {group, k, value, spec, l10n, onChange, ...props} = this.props
      let changeHandler = (ev) => onChange([group, k], parseInt(ev.target.value))

      let className = []
      if (value.patched)
         className = className.concat(['patched'])

      if (spec.default !== value.value)
         className = className.concat(['non-default'])

      let
         val = value.value,
         bsStyle = undefined,
         helpText = undefined

      if (spec.range[0] > val || spec.range[1] < val) {
        bsStyle = 'error'
        helpText = `value should be in range ${spec.range[0]}..${spec.range[1]}`
      } else if (value.patched) {
        bsStyle = 'success'
      }

      return (
         <div><Input
            type="number"
            min={spec.range[0]}
            max={spec.range[1]}
            className={className.join(' ')}
            wrapperClassName="col-xs-8"
            labelClassName="col-xs-12"
            label={l10n[group + "." + k].name || (group + "." + k)}
            value={value.value}
            placeholder={spec.default}
            onChange={changeHandler}
            help={helpText}
            bsStyle={bsStyle}
            disabled={spec.ro}
            {...props} />

            {spec.ro || <div>
              <Col xs={2}>
               <Button
                  bsStyle="default"
                  disabled={!value.patched}
                  title={`Reset to stored value '${ value.original }'`}
                  onClick={(ev) => onChange([group, k], value.original)}
                  ><Glyphicon glyph="remove-sign" /></Button>
              </Col>
              <Col xs={2}>
               <Button
                  bsStyle="default"
                  disabled={value.value == spec.default}
                  onClick={(ev) => onChange([group, k], spec.default )}
                  title={`Reset to default value '${ spec.default }'`}
                  ><Glyphicon glyph="exclamation-sign" /></Button>
              </Col>
            </div>}
      </div>)
   }
}

class ConfigInputEnum extends React.Component {
   render() {
      let {group, k, value, spec, l10n, onChange, ...props} = this.props
      let changeHandler = (ev) => onChange([group, k], parseInt(ev.target.value))

      let helpText, bsStyle
      if (-1 === spec.enum.lastIndexOf(value.value)) {
        bsStyle = 'error'
        helpText = `value should be one of: ${spec.enum.join(", ")}`
      } else if (value.patched) {
        bsStyle = 'success'
      }

      return (
         <div>
            <Input
               type="select"
               className={spec.default === spec.value ? 'default' : 'non-default'}
               wrapperClassName="col-xs-8"
               labelClassName="col-xs-12"
               label={l10n[group + "." + k].name || (group + "." + k)}
               value={value.value}
               placeholder={spec.default}
               onChange={changeHandler}
               help={helpText}
               bsStyle={bsStyle}
               disabled={spec.ro}
               {...props}>

               {_.map(spec.enum, (val, idx) => <option key={idx} value={val}>{val}</option>)}
            </Input>

            {spec.ro || <div>
              <Col xs={2}>
               <Button
                  bsStyle="default"
                  disabled={!value.patched}
                  title={`Reset to stored value '${ value.original }'`}
                  onClick={(ev) => onChange([group, k], value.original)}
                  ><Glyphicon glyph="remove-sign" /></Button>
              </Col>
              <Col xs={2}>
               <Button
                  bsStyle="default"
                  disabled={value.value == spec.default}
                  onClick={(ev) => onChange([group, k], spec.default )}
                  title={`Reset to default value '${ spec.default }'`}
                  ><Glyphicon glyph="exclamation-sign" /></Button>
              </Col>
            </div>}
         </div>
      )
   }
}

class ConfigInputStatic extends React.Component {
   render() {
      let {group, k, value, spec, l10n, onChange, ...props} = this.props
      let changeHandler = (ev) => onChange([group, k], ev.target.value)

      return (
         <div>
            <FormControls.Static
               wrapperClassName="col-xs-8"
               labelClassName="col-xs-12"
               label={l10n[group + "." + k].name || (group + "." + k)}
               value={value.value}
               {...props} />
         </div>
      )
   }
}

class ConfigInput extends React.Component {
   render() {
      let {spec} = this.props

      if (spec.enum)
         return <ConfigInputEnum {...this.props} />
      else if(spec.range)
         return <ConfigInputRange {...this.props} />
      else
         return <ConfigInputStatic {...this.props} />
   }
}

export class Config extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      stream: null,
      activeGroup: undefined,
      config: null,

      getConfig: null,
      getConfigError: null,

      patch: {},
    }

    this.handleChange = this.handleChange.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    let
      {nid, key} = this.props.params,
      nextNid = this.props.params.nid,
      nextKey = this.props.params.key

    if (nid !== nextNid || key !== nextKey) {
      if (this.state.stream)
        this.state.stream.close()

      this.setState({stream: this.findOrRequestConfig(nextNid, nextKey)})
    }
  }

  componentWillMount() {
    let {nid, key} = this.props.params

    if (this.state.stream)
      this.state.stream.close()

    this.setState({stream: this.findOrRequestConfig(nid, key)})
  }

  findOrRequestConfig(nid, key) {
    if (!nid)
      throw("first agument `nid` cannot be undefined or null")

    if (!key)
      throw("second agument `key` cannot be undefined or null")

    let q = 'proto/tm.detail == "config" or proto/tm.detail == "reset"'

    let
      QueryStream = require('../QueryStream.jsx').QueryStream,
      res = new QueryStream({
        'date.from': 'NOW//-24HOUR',
        'continuous': true,
        'query': q,
        'uri': '/' + nid + '/' + key
      })

      res.on('error', function(err, req) { null })

      res.on('data', (ev) => {
         let proto
         if (proto = ev['proto/tm'])
            res.emit(proto.type + "/" + (proto.detail || proto.command), ev)
      })

      res.on('event/reset', (ev) => {
        let setCfgDate = (this.state.setConfig || {}).datetime
        if (setCfgDate && setCfgDate < ev.datetime) {
          // let's assume that our patch was applied
          this.setState( state => {
            state.config['proto/tm'].config = _.merge(state.config['proto/tm'].config, state.patch)
            state.patch = {}
            return state
          })

          this.getConfig()
        }

        if (!this.state.config || ev.datetime < this.state.config.datetime)
          return

        if (this.state.config.conflict && ev.datetime < this.state.config.conflict.datetime)
          return

        this.setState((state) => {
          state.config.conflict = ev
          return state
        })
      })

      res.on('event/config', (cfg) => {
         if (this.state.timer) {
            clearTimeout(this.state.timer)
            this.setState({timer: null})
         }

         if (!this.state.config || cfg.datetime > this.state.config.datetime) {
            if (this.state.config && (this.state.config.conflict && cfg.datetime < this.state.config.conflict.datetime))
              cfg.conflict = this.state.config.conflict.datetime

            this.setState({config: cfg})
         }
      })

      return res
  }

  componentWillUnmount() {
    this._mounted = false

    if (this.state.stream)
      this.state.stream.close()
  }


  handleChange(path, v) {
    this.setState(function(state) {
      if (_.get(state, ['config', 'proto/tm', 'config'].concat(path)) === v) {
         return _unset(state, ['patch'].concat(path))
      }

      return _.set(state, ['patch'].concat(path), v)
    })
  }

  findValues(path) {
    let
      patchVal = _.get(this.state.patch, path),
      val = _.get(this.state.config, ['proto/tm', 'config'].concat(path))


    return {
      'value': patchVal === val || undefined === patchVal ? val : patchVal,
      'patched': undefined !== patchVal,
      'original': val,
    }
  }

  sendConfig() {
   let
      payload = JSON.stringify({'proto/tm': {'type': 'command', 'command': 'set_config', 'config': this.state.patch}}),
		url = BASE_URL + '/message/' + this.props.params.nid + '/' + this.props.params.key,
		headers = {
			'Authorization': AuthStore.signV1('POST', url, payload),
			'Content-Type':  'application/json'
		}

	axios.post(url, payload, {headers})
      .then( (resp)  => this.setState({confirmDialog: false, setConfig: resp.data}) )
      .catch( (resp) => this.setState({confirmDialog: false, setConfig: resp.data}) )
  }

  getConfig() {
    let
      {nid, key} = this.props.params,
      payload = JSON.stringify({'proto/tm': {'type': 'command', 'command': 'get_config'}}),
      url = BASE_URL + '/message/' + nid + '/' + key,
      headers = {
         'Authorization': AuthStore.signV1('POST', url, payload),
         'Content-Type':  'application/json'
      },
      timer = null

    axios.post(url, payload, {headers})
      .then(  (resp) => {
        timer = setTimeout(() => {
          this.setState({getConfigError: "timeout"})
        }, 5000)
        this.setState({getConfig: resp.data, getConfigError: null, timer: timer})
      })
      .catch( (resp) => this.setState({getConfig: null,      getConfigError: resp.data, timer: timer}) )
  }

  render() {
    let
      cfgdef = require("../../../config/1.38.json"),
      l10n = require("../../../config/1.38-l10n.json"),
      keys = _.keys(cfgdef),
      groups = _.reduce(cfgdef,
               function (acc, v, k) {
                  if (k.match(/^gpio_/)) {
                     if (!acc["gpio"])
                        acc["gpio"] = []

                     acc["gpio"].push([k, v])
                  } else {
                     if (!acc[k])
                        acc[k] = []

                     acc[k].push([k, v])
                  }

                  return acc
               },
               {})

    let activeGroup = this.state.activeGroup || _.keys(groups)[0]

    let {config, getConfigError, getConfig, stream} = this.state

    return (
      <Loading loading={null == this.props.device} style={{height: '100%'}}>
         <div className="device-config modal-contain" style={{height: '100%'}}>
            <FetchConfigModal
               config={config}
               getConfigError={getConfigError}
               getConfig={getConfig}
               container={this}
               stream={stream}
               fetchConfig={() => this.getConfig()}
               autoFocus={false}
               enforceFocus={false}
               animation={false}
               />

            <ConfirmConfigModal
               patch={this.state.patch}
               cont={() => this.sendConfig()}
               show={this.state.confirmDialog}
               onHide={() => this.setState({confirmDialog: false})}
               />

            {config && <div>
               <Col xs={4} md={3} className="aside">
                  <h4>Configuration Groups</h4>

                  <Nav
                     onSelect={(k) => this.setState({activeGroup: k})}
                     bsStyle="pills"
                     activeKey={activeGroup}
                     stacked>
                     {_.map(groups, (v, idx) => <NavItem eventKey={idx} key={idx}>{l10n[idx].name || idx}</NavItem>)}
                  </Nav>
               </Col>
               <Col xs={8} md={9}>
                  {_.map(groups[activeGroup], (group, idx) =>
                     <Row className="groups" key={idx}>
                       <Col xs={12} className="page-header">
                          <h4>Group: {group[0]}</h4>
                       </Col>

                       <Col xs={12} className="white-bg">
                       {_.map(group[1], (spec, k) =>
                        <Col key={k} className="config-item" xs={12} md={4} lg={4}>
                           <ConfigInput
                              l10n={l10n}
                              key={idx + k}
                              spec={spec}
                              value={ this.findValues([group[0], k]) }
                              group={group[0]}
                              k={k}
                              onChange={this.handleChange} />
                        </Col>
                       )}
                       </Col>
                     </Row>
                  )}

                  <div>
                     <Button
                       bsStyle="primary"
                       onClick={() => this.setState({confirmDialog: true})}>
                         Save Configuration
                     </Button>

                     <Button
                       bsStyle="warning"
                       onClick={() => this.getConfig()}>
                         Reload Device Configuration 
                     </Button>
                  </div>
               </Col>
            </div>}
         </div>
      </Loading>
    )
  }
}

class FetchConfigModal extends React.Component {
   render() {

      let {config, getConfig, getConfigError, onHide, fetchConfig, show, ...rest} = this.props

      onHide = onHide || () => null

      return (
         <Modal
            className={getConfigError  ? "modal-error" : "modal-wait"}
            onHide={onHide}
            show={undefined !== show ? show : (!config || !!config.conflict)}
            {...rest}>

            <Modal.Header>
               <Modal.Title>
                  <Glyphicon glyph="time">&nbsp;</Glyphicon>

                  No Configuration Available
               </Modal.Title>
            </Modal.Header>

            <Modal.Body>
               {!config && <p>
                  We don't seem to have the configuration details for this
                  device. To configure the device this configuration must
                  be available.
               </p>}

               {(config && config.conflict) && <p>
                  Some changes have been made to your configuration and
                  you will have to refetch the latest configuration from your device.
               </p>}


               {!getConfigError && <p>
                  Do you want to fetch it now?
               </p>}

               {getConfigError && <p>
                  <b>An error occured:</b> <code>{JSON.stringify(getConfigError)}</code>
               </p>}
            </Modal.Body>

            <Modal.Footer>
                 <Button
                     bsStyle="primary"
                     disabled={!!getConfig && (!getConfigError && !config)}
                     onClick={fetchConfig}>

                {(getConfig && !config && !getConfigError) && <Spinner spinnerName="circle" />}

                Fetch Configuration
              </Button>
            </Modal.Footer>
         </Modal>
      )
   }
}

class ConfirmConfigModal extends React.Component {
   render() {
      let {patch, cont, show, onHide} = this.props

      return (
         <Modal
            className="modal-wait"
            show={show}
            onHide={onHide}>

            <Modal.Header>
               <Modal.Title>
                  <Glyphicon glyph="ok">&nbsp;</Glyphicon>

                  You'r about to change the device configuration
               </Modal.Title>
            </Modal.Header>

            <Modal.Body>
               Are you sure you want to change the following parameters?

               <ul>
                  {_(patch)
                    .map(
                     (items, group) => _.map(items,
                        (v, k) => <li key={k}>{group}.{k} -> {v}</li>) )
                    .flatten()
                    .value()}
               </ul>
            </Modal.Body>

            <Modal.Footer>
               <Button bsStyle="primary" onClick={cont}>
                  Save Configuration
               </Button>
            </Modal.Footer>
         </Modal>
      )
   }
}
