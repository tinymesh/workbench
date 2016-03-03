import React from 'react/addons'
import Mixin from 'react-mixin'

import _ from 'lodash'
import {HotKeys} from 'react-hotkeys'

import {Label} from 'react-bootstrap'

export class Terminal extends React.Component {
   constructor() {
     super()

     this.state = {
         history: [],
         pointer: 0,
         keepLines: 1000,
         body: null,
         input: "",

         boundingRect:  null,
         parentRect:   null
      }

      this.handleResize = this.handleResize.bind(this)
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

   componentDidMount() {
      this._mounted = true

      window.addEventListener('resize', this.handleResize)
      setTimeout(this.handleResize, 0) // align first!
   }

   componentWillUnmount() {
      this._mounted = false

      window.removeEventListener('resize', this.handleResize)
   }

   handleResize() {
      let parentRect


      if (this.refs.autosize)
         parentRect = this.refs.autosize.getDOMNode()
                                        .parentNode
                                        .getBoundingClientRect()

      this.setState({
         boundingRect: document.getElementsByTagName('body')[0].getBoundingClientRect(),
         parentRect: parentRect
      })
   }

   scrollOutput() {
      if (this.refs.output) {
         let node = this.refs.output.getDOMNode()
         node.scrollTop = node.scrollHeight
      }
   }

   componentDidUpdate() {
      this.scrollOutput()
   }

   input(input) {
     if (!input) {
       this.setState({pointer: -1})
       return
     }

     let encode = buf => (Buffer.isBuffer(buf) ? buf.toString() : buf)

     let
       res = this.props.onInput ? this.props.onInput(input) : input,
       elem = [
         <span className="input"><br />&gt;&nbsp;{input}</span>,
         res ? res : null
       ]

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

      let {labels, className} = this.props
      let {boundingRect, parentRect} = this.state


      let height = 100
      if (boundingRect)
         height = boundingRect.height - parentRect.top - 60

      return (
         <div
            ref="autosize"
            style={{height: height + 'px'}}
            className={"terminal " + className || ""}>

            <pre
               ref="output"
               style={{height: (height - 60) + 'px', overflow: 'hidden'}}>{output}</pre>
            <div className="input-line line" ref="inputLine">
            <div className="prompt">&gt;<br />&nbsp;</div>
               <div style={{position: 'relative'}}>
                  <HotKeys handlers={handlers} keyMap={bindings}>
                    <input
                      type="text"
                      valueLink={stateLink}
                      className="cmdline" autofocus />
                  </HotKeys>
                  <div className="labels" style={{position: 'absolute', marginTop: '-22px', right: '9.5px'}}>
                     {_.map(labels, label => _.isString(label) ? <Label style={{marginLeft: '5px'}}>{label}</Label> : label)}
                  </div>
                  <span>{this.state.shadowInput || " "}</span>
               </div>
            </div>
         </div>
      )
   }
}

Mixin(Terminal.prototype, React.addons.LinkedStateMixin)
