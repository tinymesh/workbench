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
import {Stream} from '../../../Stream.jsx'
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
            wrapperClassName="col-xs-9"
            labelClassName="col-xs-12"
            label={l10n[group + "." + k].name || (group + "." + k)}
            value={value.value}
            placeholder={spec.default}
            onChange={changeHandler}
            help={helpText}
            bsStyle={bsStyle}
            disabled={spec.ro}
            {...props} />

            {spec.ro || <Col xs={3}>
               <Button
                  bsStyle="default"
                  disabled={!value.patched}
                  title={`Reset to stored value '${ value.original }'`}
                  onClick={(ev) => onChange([group, k], value.original)}
                  ><Glyphicon glyph="remove-sign" /></Button>
               &nbsp;
               <Button
                  bsStyle="default"
                  disabled={value.value == spec.default}
                  onClick={(ev) => onChange([group, k], spec.default )}
                  title={`Reset to default value '${ spec.default }'`}
                  ><Glyphicon glyph="exclamation-sign" /></Button>
            </Col>}
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
               wrapperClassName="col-xs-9"
               labelClassName="col-xs-12"
               label={l10n[group + "." + k].name || (group + "." + k)}
               value={value}
               placeholder={spec.default}
               onChange={changeHandler}
               help={helpText}
               bsStyle={bsStyle}
               disabled={spec.ro}
               {...props}>

               {_.map(spec.enum, (val, idx) => <option key={idx} value={val}>{val}</option>)}
            </Input>

            {spec.ro || <Col xs={3}>
               <Button
                  bsStyle="default"
                  disabled={!value.patched}
                  title={`Reset to stored value '${ value.original }'`}
                  onClick={(ev) => onChange([group, k], value.original)}
                  ><Glyphicon glyph="remove-sign" /></Button>
               &nbsp;
               <Button
                  bsStyle="default"
                  disabled={value.value == spec.default}
                  onClick={(ev) => onChange([group, k], spec.default )}
                  title={`Reset to default value '${ spec.default }'`}
                  ><Glyphicon glyph="exclamation-sign" /></Button>
            </Col>}
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
               wrapperClassName="col-xs-9"
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

      patch: {},

      modalHidden: false,
      configFetchedErr: null,
      confirmDialog: false
    }

    this.handleChange = this.handleChange.bind(this)
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.params.nid !== nextProps.params.nid || this.props.params.key !== nextProps.params.key) {
      if (this.state.stream)
        this.state.stream.close()

      let {nid, key} = nextProps.params

      this.setState({stream: this.stream(nid, key)})
    }
  }

  componentWillMount() {
    let {nid, key} = this.props.params

    this.setState({stream: this.stream(nid, key)})
   }

  componentWillUnmount() {
    this._mounted = false

    if (this.state.stream)
      this.state.stream.close()
  }

  stream(nid, dev, opts) {
    let query = "message/" + nid + "/" + dev +" : :nil != proto/tm.config"

    if (this.state.stream)
      this.state.stream.close()

    let stream = new Stream(query)

    stream.on("message", (data) => this.handleMessage(data))
  }

   handleMessage(data) {
      if (!data['proto/tm'].config)
         return

      this.setState({config: data['proto/tm'].config, configFetched: true})
   }

  fetchConfig(nid, key) {
    let promise, url, payload, headers


    url = BASE_URL + '/message/' + nid + '/' + key
    payload = {
       'proto/tm': {"type": "command", "command": "get_config"}
    }

    headers  = {
       'Authorization': AuthStore.signV1('POST', url, JSON.stringify(payload)),
       'Content-Type':  'text/json'
    }

    this.setState({config: undefined, configFetchedErr: null})
    return axios.post(url, payload, {headers})
                .catch((err) => this.setState({config: null, configFetchedErr: err}))
  }

  handleChange(path, v) {
    this.setState(function(state) {
      if (_.get(state, ['config'].concat(path)) === v) {
         return _unset(state, ['patch'].concat(path))
      }

      return _.set(state, ['patch'].concat(path), v)
    })
  }

  findValues(path) {
    let
      patchVal = _.get(this.state.patch, path),
      val = _.get(this.state.config, path)

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
      .then(() => this.setState({confirmDialog: false}))
      .catch(() => this.setState({confirmDialog: false}))
}

  render() {
    let
      config = require("../../../config/1.38.json"),
      l10n = require("../../../config/1.38-l10n.json"),
      keys = _.keys(config),
      groups = _.reduce(config,
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

    let activeGroup = this.state.activeGroup ||_.keys(groups)[0]


    return (
      <Loading loading={null == this.props.device}>
         <div className="device-config">
            <Modal
               className="modal-wait"
               show={!this.state.config || this.state.modalHidden}
               onHide={() => this.props.history.push('/dashboard/device/' + this.props.params.nid + '/' + this.props.params.key)}>

               <Modal.Header>
                  <Modal.Title>
                     <Glyphicon glyph="time">&nbsp;</Glyphicon>

                     Fetch configuration
                  </Modal.Title>
               </Modal.Header>

            <Modal.Body>
               To configure your device we need to fetch the current
               configuration.

               {this.state.configFetchedErr && <div>
                  <h4>An error occured:</h4>

                  <hr />

                  <pre>{JSON.stringify(this.state.configFetchedErr.data, null, 4)}</pre>
               </div>}
            </Modal.Body>

            <Modal.Footer>
                 <Button
                     bsStyle="primary"
                     disabled={(null !== this.state.config && !this.state.configFetchedErr)}
                     onClick={() => this.fetchConfig(this.props.device.network, this.props.device.key)}>
                {(undefined === this.state.config && !this.state.configFetchedErr) && <Spinner spinnerName="circle" />}

                Fetch Configuration
              </Button>
            </Modal.Footer>
            </Modal>

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
                        <Col className="config-item" xs={12} md={5} mdPull={1} mdOffset={1} lg={4}>
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
                  </div>
               </Col>
            </div>}
         </div>
      </Loading>
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
