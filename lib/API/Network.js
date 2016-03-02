import React from 'react'

import {NetworkStore} from '../stores/Network'

class Network extends React.Component {
   constructor(props) {
      super(props)

      this.setState({network: null})
   }

   componentWillReceiveProps(nextProps) {
      if (!nextProps.params.nid)
         console.log('WARN: NetAPI nextProps missing parameter `nid`')

      if (this.props.params.nid !== nextProps.params.nid) {
         let network = NetworkStore.network(nextProps.params.nid)

         if (!network)
            NetworkStore.network(nextProps.params.nid)
      }
   }

   componentWillMount() {
      if (!this.props.params.nid)
         console.log('WARN: NetAPI missing parameter `nid`')

      this._mounted = true

      NetworkStore.addChangeListener( this._changeListener = () => {
         if (this._mounted)
            this.setState({network: NetworkStore.network(this.props.params.nid)})
      })
   }

   componentWillUnmount() {
      this._mounted = false

      NetworkStore.removeChangeListener( this._changeListener )
   }

   render() {
      let {network} = this.state

      return React.cloneElement(this.props.children, {network})
   }
}
