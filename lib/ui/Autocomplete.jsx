import ReactDOM from 'react-dom';
import React from 'react';

import Typeahead from 'react-typeahead-component'
import { EventEmitter } from 'events'

import _ from 'lodash'

class AutocompleteOption extends React.Component {
   render() {
      let split = this.props.data.split(this.props.inputValue)
      if (1 === split.length)
         return (<span>{this.props.data}</span>)
      else {
         let
            head = split[0],
            center = this.props.inputValue,
            tail = split.slice(1).join(center)
         return (
            <span>
               <span className="head">{head}</span>
               <span className="highlight">{center}</span>
               <span className="tail">{tail}</span>
            </span>
         )
      }
   }
}

const god = () => true

export class AutocompleteOptionsStore extends EventEmitter {
   constructor() {
      super()

      try {
         this._options = JSON.parse(localStorage.msgQueryCols || "[]")
      } catch (e) {
         localStorage.msgQueryCols = []
         this._options = []
      }
   }

   emitChange() {
      this.emit("CHANGE")
   }

   addChangeListener(cb) {
     this.on("CHANGE", cb)
   }

   removeChangeListener(cb) {
     this.removeListener("CHANGE", cb)
   }

   add() {
      let changed = false

      _.each(arguments, (option) => {
         if (this._options.lastIndexOf(option) >= 0)
            return

         this._options = this._options.concat([option])
         changed = true;
      })

      if (changed) {
         this.emitChange()
         localStorage.msgQueryCols = JSON.stringify(this._options)
      }
   }

   remove(option) {
      let length = this._options.length
      this._options = _.without(this._options, option)

      if (this._options.length !== length)
         this.emitChange()
   }

   filter(input, limit, check) {
      check = check || god
      return _(this._options)
         .filter( (val) => check(val) && null != val.match(input))
         .take(limit || 10)
         .sortBy()
         .value()
   }
}


export class Autocomplete extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         inputValue: "",
         options: props.store
      }
   }

   componentWillMount() {
      let {options} = this.state

      options.addChangeListener( this._changeHandler = () =>
         this._mounted && this.forceUpdate()
      )
   }

   componentDidMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
      let {options} = this.state
      options.removeChangeListener(this._changeHandler)
   }

   componentWillReceiveProps(nextProps) {
      if (!nextProps.store)
         console.log("WARN: options store is not selected")
   }

   handleInput(ev) {
      this.setState({inputValue: ev.target.value})
   }

   handleInputClick(ev, option) {
      let {onSelect} = this.props

      this.setState({inputValue: ""}, () => onSelect(ev, option))
   }

   render() {
      let
         {optsLimit, filter} = this.props,
         {inputValue, options} = this.state,
         filteredOptions = options.filter(inputValue, optsLimit, filter)

      return (
         <Typeahead
            inputValue={inputValue}
            optionTemplate={this.props.template || AutocompleteOption}
            options={filteredOptions}
            onChange={(ev) => this.handleInput(ev)}
            onOptionClick={(ev, option) => this.handleInputClick(ev, option)}
            onComplete={(ev, completed) => console.log(completed)}
            />
      )
   }
}
