import React from 'react'
import {DeviceStore, DeviceService} from '../stores/Device'

export default class DeviceList extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         devices: null
      }
   }

   componentWillReceiveProps(nextProps) {
      if (!nextProps.nid) {
         console.log('WARN: API.DeviceList nextProps missing parameter `nid`')
         return
      }

      if (this.props.nid !== nextProps.nid) {
         DeviceStore.devices(nextProps.params.nid)
      }
   }

   componentWillMount() {
      this._mounted = true

      if (!this.props.nid) {
         console.log('WARN: API.DeviceList missing parameter `nid`')
      }

      this.setState({devices: DeviceStore.devices(this.props.nid)})

      DeviceStore.addChangeListener( this._devChangeListener = () => {
         if (this._mounted)
            this.setState({devices: DeviceStore.devices(this.props.nid)})
      })
   }

   componentWillUnmount() {
      this._mounted = false

      DeviceStore.removeChangeListener(  this._devChangeListener )
   }

   render() {
      let {devices} = this.state
      let {nid, ...props} = this.state
      return React.cloneElement(this.props.children, {devices, ...props})
   }
}
