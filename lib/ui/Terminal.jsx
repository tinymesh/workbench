import React from 'react/addons'
import Mixin from 'react-mixin'

import _ from 'lodash'
import {HotKeys} from 'react-hotkeys'

export class Terminal extends React.Component {
   constructor() {
     super()

     this.state = {
       history: [],
       pointer: 0,
       keepLines: 1000,
       body: null,
       input: ""
     }
   }

   componentWillReceiveProps(nextProps) {
     if (this.props.newLines !== nextProps.newLines) {
       this.setState({
         body: this.state.body.concat(nextProps.newLines),
       })
     }
   }

   componentWillMount() {
     this.setState({body: this.props.body || []})
   }

   input(input) {
     if (!input) {
       this.setState({pointer: -1})
       return
     }

     let encode = buf => (Buffer.isBuffer(buf) ? buf.toString() : buf)

     let
       res = this.props.handle ? this.props.handle(input) : input,
       elem = [
         <span className="input"><br />&gt;&nbsp;{input}</span>,
         res && res.error ? res : null
       ]

     //"> " + input, res]),

     this.setState({
       input: res.error ? input : "",
       shadowInput: undefined !== res.pos ?  (Array(res.pos).join(' ') + "^") : "",
       history: this.state.history.concat([input]),
       body:    this.state.body.concat(elem),
       pointer: -1
     })
   }

   history(step) {
     let
       p = this.state.pointer,
       size  = this.state.history.length

     if (1 === step && (-1 === p || size <= p)) {
       this.setState({pointer: -1, input: this.state.history[size-1]})
       return
     }

     if (-1 === step && 0 === p)
       return

     if (-1 === p)
       p = this.state.history.length

     this.setState({
       input: this.state.history[p + step],
       pointer: p + step
     })

   }

   render() {
      const bindings = {
        'history-back': 'up',
        'history-forward': 'down',
        'call': 'return'
      }

      const handlers = {
        'history-back':    (ev) => this.history(-1),
        'history-forward': (ev) => this.history(1),
        'call':            (ev) => this.input(this.state.input)
      }

      let formatter = this.props.formatter || ((line) => line)

      let stateLink, oldStateLink
      stateLink = this.linkState('input')
      oldStateLink = stateLink.requestChange

      stateLink.requestChange = function(value) {
        this.setState({shadowInput: ""})
        return oldStateLink(value)
      }.bind(this)

      let output = _.map(this.state.body, function(line) {
          let res = formatter(line)

          if (null == res)
            return null

          return res
        })

      if (this.props.height) {
        let padding = Array(Math.max(0, this.props.height - output.length))
        output = output.concat(padding).slice(-1 * this.props.height)
      }

      return (
         <div className="terminal">
            <pre>
               {output}
            </pre>
            <div className="input-line line" ref="inputLine">
            <div className="prompt">&gt;<br />&nbsp;</div>
               <div>
                  <HotKeys handlers={handlers} keyMap={bindings}>
                    <input
                      type="text"
                      valueLink={stateLink}
                      className="cmdline" autofocus />
                  </HotKeys>
                  <span>{this.state.shadowInput || " "}</span>
               </div>
            </div>
         </div>
      )
   }
}

Mixin(Terminal.prototype, React.addons.LinkedStateMixin)
