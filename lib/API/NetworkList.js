import React from 'react'

import {NetworkStore} from '../stores/Network'

export default class NetworkList extends React.Component {
   constructor(props) {
      super(props)
      this.state = {
         networks: null
      }
   }

   componentWillMount() {
      this._mounted = true

      this.setState({networks: NetworkStore.networks})

      NetworkStore.addChangeListener( this._changeListener = () => {
         if (this._mounted)
            this.setState({networks: NetworkStore.networks})
      })
   }

   componentWillUnmount() {
      this._mounted = false

      NetworkStore.removeChangeListener( this._changeListener )
   }

   render() {
      return React.cloneElement(this.props.children, {networks: this.state.networks})
   }
}
