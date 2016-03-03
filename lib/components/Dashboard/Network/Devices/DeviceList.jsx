import React from 'react'

import {Row, Col, Table, DropdownButton, MenuItem} from 'react-bootstrap'
import {Link} from 'react-router'
import {FormattedRelative, FormattedDate} from 'react-intl'

import {DeviceStore, DeviceService} from '../../../../stores'
import {AddressEncoder, Loading, Notify} from '../../../../ui'
import {LinkUtil} from '../../../../util'

import {CreateDevice} from './CreateDevice.jsx'

export class DeviceList extends React.Component {
  constructor() {
    super()

    this._notify = new Notify.Store()

    this.state = {
      devices: null,
      loading: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params.nid !== nextProps.params.nid)
      this.loadForNetwork(nextProps.params.nid)
  }

  componentWillMount() {
  }

  componentDidMount() {
    this._mounted = true

    DeviceStore.addChangeListener( this._changeListener = () => {
      if (this._mounted)
        this.setState({devices: DeviceStore.devices(this.props.params.nid)})
    })

    this.loadForNetwork(this.props.params.nid)
  }

  componentWillUnmount() {
    this._mounted = false

    DeviceStore.removeChangeListener(this._changeListener)
  }

  loadForNetwork(nid) {
    this.setState({loading: false})
    DeviceService.list(nid)
  }


  render() {
    let fakeDevices = _.times(Math.max(0, 5 - (this.state.devices || []).length), "")
    let query = this.props.location.query
    let
      stateLink = (patch, name, deleteIfSame) => {
        let newQuery = _.reduce(patch,
          (acc, v, k) => _.set(acc,
                               k,
                               deleteIfSame && _.get(acc, k) === v ? undefined : v),
          _.cloneDeep(query))

        return <Link to={LinkUtil.path(this, '')} query={newQuery}>{name}</Link>
      }

    query.ascending = "true" === query.ascending

    let sortFilterAndMap = (devices, mapper) => {
      if (!devices)
        return

      return _.chain(devices)
        .where(query.filter)
        .sortByOrder([query.sortBy], [query.ascending ? 'asc' : 'desc'])
        .map(mapper)
        .value()
    }

    let encodings = {
      "hex": "HEX",
      "bin": "Binary",
      "dec": "Decimal"
    }

    return (
      <div>
        {this._notify.length > 0 && <Row className="notifications section">
          <Notify store={this._notify} />
        </Row>}

        <Row style={{marginBottom: '2rem'}}>
          <Col xs={11} className="text-right">
            <DropdownButton title={"Encoding: " + encodings[AddressEncoder.format]} id="encoding">
              {_.map(encodings, (text, k) =>
                <MenuItem
                  eventKey={k}
                  key={k}
                  onSelect={() => {AddressEncoder.format = k; this.forceUpdate()}}

                  >{text}</MenuItem>
              )}
            </DropdownButton>
          </Col>
        </Row>

        <Row className="overview section main">
          <Col xs={12}>
            <Loading loading={this.state.loading}>
              <Table>
                <thead>
                  <tr>
                    <th>{stateLink({sortBy: 'key', ascending: !query.ascending}, 'Key')}</th>
                    <th>{stateLink({sortBy: 'address', ascending: !query.ascending}, 'UID')}</th>
                    <th>{stateLink({sortBy: 'name', ascending: !query.ascending}, 'Name')}</th>
                    <th>{stateLink({sortBy: 'type', ascending: !query.ascending}, "Type")}</th>
                    <th title="When was the device last updated">
                      {stateLink({sortBy: 'meta.updated', ascending: !query.ascending}, 'Last Updated')}
                    </th>

                    <th title="When did the device receive it's last message">
                      {stateLink({sortBy: 'meta.event/date', ascending: !query.ascending}, 'Last Message')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortFilterAndMap(this.state.devices, (device, idx) =>
                    <tr key={idx}>
                      <td><Link to={LinkUtil.path(this, '../device/:network/:key', device)}>{device.key}</Link></td>
                      <td>{AddressEncoder.encode(device.address)}</td>
                      <td>{device.name || "Unnamed device"}</td>
                      <td>{stateLink({'filter.type': device.type}, device.type, true)}</td>
                      <td title={device.meta.updated}>
                        {device.meta.updated && <FormattedRelative value={device.meta.updated} />}
                      </td>
                      <td title={device.meta['event/date']}>
                        {device.meta['event/data'] && <FormattedRelative value={device.meta['event/date']} />}
                      </td>
                    </tr>
                  )}
                  {fakeDevices.map( (v, idx) =>
                    <tr key={idx}>
                      <td><span className="dummy-block" style={{display: 'inline-block', width: "100px"}}>&nbsp;</span></td>
                      <td><span className="dummy-block" style={{display: 'inline-block', width: "100px"}}>&nbsp;</span></td>
                      <td><span className="dummy-block" style={{display: 'inline-block', width: "300px"}}>&nbsp;</span></td>
                      <td><span className="dummy-block" style={{display: 'inline-block', width: "100px"}}>&nbsp;</span></td>
                      <td><span className="dummy-block" style={{display: 'inline-block', width: "100px"}}>&nbsp;</span></td>
                      <td><span className="dummy-block" style={{display: 'inline-block', width: "100px"}}>&nbsp;</span></td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Loading>
          </Col>
        </Row>

        <CreateDevice {...this.props} notify={this._notify} />
      </div>
    )
  }
}
