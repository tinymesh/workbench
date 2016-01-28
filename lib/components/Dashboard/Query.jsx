import React from 'react'
import ReactDOM from 'react-dom';
import Mixin from 'react-mixin'
import {LensedStateDefaultMixin} from '../../mixin'
import _ from 'lodash'

import {QueryStream} from './QueryStream.jsx'

import {Row, Col} from 'react-bootstrap'
import {Input, Button, Label, Glyphicon} from 'react-bootstrap'

import {Table, Column, Cell} from 'fixed-data-table'

import Spinner from 'react-spinkit'
import Typeahead from 'react-typeahead-component'
import {AddressEncoder, Loading, Notify} from '../../ui'

class TypeaheadOption extends React.Component {
   render() {
      let split = this.props.data.split(this.props.inputValue)
      if (1 === split.length)
         return (<span>{this.props.data}</span>)
      else {
         let
            head = split[0],
            center = this.props.inputValue,
            tail = split.slice(1).join(center)
         return (<span>{head}<b>{center}</b>{tail}</span>)
      }
   }
}

var findPath = function(obj, path) {
  path = path || ""
  return _.reduce(obj, function(acc, v, k) {
    return _.isObject(v)
      ? acc.concat(findPath(v, path + "." + k))
      : acc.concat( (path + "." + k).replace(/^./, ''))
  }, [])
}

export class Query extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         'resources': [],
         'date-from': "",
         'date-to': "",
         'continuous': false,
         'query': "",
         'results': [],

         querystream: null,
         columnWidths: {},
         cols: ['datetime', 'proto/tm.type', 'proto/tm.detail'],

         addColValue: "",
         colValues: []
      }

      this._onColumnResizeEndCallback = this._onColumnResizeEndCallback.bind(this)
   }

   componentWillMount() {
      this._mounted = true
      this._notify = new Notify.Store()

      let resources = []

      if (this.props.device)
         resources = resources.concat([["device", this.props.device]])

      if (this.props.network)
         resources = resources.concat([["network", this.props.network]])

      this.setState({resources: resources})
   }

   componentWillUnmount() {
      this._mounted = false
      this._notify = null
   }

   componentWillReceiveProps(nextProps) {
      let resources = []

      if (nextProps.device)
         resources = resources.concat([['device', nextProps.device]])

      if (nextProps.network)
         resources = resources.concat([['network', nextProps.network]])

      this.setState({resources: resources})
   }

   toggleContinuous() {
      if (this.state.continuous && this.state.querystream) {
         this.state.querystream.close()
         this.setState({continuous: !this.state.continuous, querystream: null})
      } else {
         this.setState({continuous: !this.state.continuous})
      }
   }

   runQuery() {
      console.log("run query")
      if (1 != this.state.resources.length) {
         alert("Query must contain exactly one resource. Got " + this.state.resources.length);
      }

      let resource

      switch (this.state.resources[0][0]) {
         case "network":
            resource = "/" + this.state.resources[0][1].key
            break

         case "device":
            resource = "/" + this.state.resources[0][1].network + '/' + this.state.resources[0][1].key
            break

         default:
            alert("Invalid resource type: " + this.state.resources[0][0])
            return
      }

      let res = new QueryStream({
         'date.from':  this.state['date-from'],
         'date.to':    this.state['date-to'],
         'continuous': this.state.continuous,
         'query':      this.state.query,
         'uri':        resource,
      })

      res.on('error',     (err) => {
         console.log('error', err)
         if (!err && this.state.querystream)
            this.state.querystream && this.state.querystream.close()
      })
      res.on('complete',  () => {console.log('completed'); this.setState({querystream: null})})
      res.on('data',      (data) => {
         // skip initial return
         if (data.meta || 'ping' === data)
            return

         this.setState({
            results: _.sortByOrder(this.state.results.concat([data]), ['datetime'], ['desc']),
            colValues: _(this.state.colValues.concat(findPath(data))).unique().sortBy().value()
         })
      })

     this.setState({querystream: res, results: []})
   }

  _onColumnResizeEndCallback(newColumnWidth, columnKey) {
    this.setState(({columnWidths}) => ({
      columnWidths: {
        ...columnWidths,
        [columnKey]: newColumnWidth,
      }
    }));
  }

   render() {
      let rows  = this.state.results
      let {cols, columnWidths, addColValue, colValues} = this.state

      let filteredColValues = _(colValues)
         .filter( (val) => (_.any(cols, (m) => val === m) ? false : null !== val.match(addColValue)))
         .take(10)
         .value()

      return (
         <Row className="query">
            <Col xs={3} md={2} className="aside">
               <div className="datasource-select">
                  {_.map(this.state.resources, (resource, idx) => {
                     switch (resource[0]) {
                        case "network":
                           return <span key={idx} className="btn btn-disabled btn-sm btn-default">network/{resource[1].key}</span>
                        case "device":
                           return <span key={idx} className="btn btn-disabled btn-sm btn-default">device/{resource[1].network}/{resource[1].key}</span>
                     }
                  })}
               </div>
               <div className="datetime-select">
                  <Input
                     type="text"
                     valueLink={this.linkState('date-from')}
                     placeholder="NOW//-1HOUR"
                     label="Query From" />

                  <Input
                     type="text"
                     valueLink={this.linkState('date-to')}
                     placeholder="NOW"
                     label="Query To" />
               </div>

               <div className="filter-results">
                  <Input
                     type="textarea"
                     valueLink={this.linkState('query')}
                     label="Query"
                     placeholder="nil !== proto/tm" />
               </div>

               <div className="pick-cols">
                  <Typeahead
                     inputValue={this.state.addColValue}
                     onChange={(ev) => this.handleColValueChange(ev)}
                     onOptionClick={(ev, opt) => this.handleColValueClick(ev, opt)}
                     placeholder="Add column"
                     options={filteredColValues}
                     optionTemplate={TypeaheadOption} />
               </div>

               <div className="run-query">
                  <Button
                     type="submit"
                     onClick={() => this.runQuery()}
                     bsStyle="primary">

                     {(!this.state.continuous && this.state.querystream) &&
                       <Spinner spinnerName="circle" />}

                     Query
                  </Button>

                  &nbsp;

                  <Button
                     type="submit"
                     bsStyle={this.state.continuous ? 'success' : 'default'}
                     onClick={() => this.toggleContinuous()}>

                     {(this.state.continuous && this.state.querystream) &&
                        <Spinner spinnerName="circle" noFadeIn />}

                     Continuous Query
                  </Button>
               </div>

            </Col>
            <Col xs={9} md={10} className="query">
               <Table
                 rowHeight={25}
                 rowsCount={rows.length}
                 headerHeight={25}
                 width={1200}
                 maxHeight={500}
                 onColumnResizeEndCallback={this._onColumnResizeEndCallback}
                 isColumnResizing={false}
                 {...this.props}>

                  {_.map(cols, (col, idx) => {
                     let path = col.split('.')

                     let cell = ({rowIndex, ...props}) => {
                        return (
                        <Cell {...props}>
                           {_.get(rows[rowIndex], path)}
                        </Cell>
                        )
                     }

                     let header = <Cell>
                        {col} <a onClick={() => this.removeCol(col)} className="pull-right">x</a>
                     </Cell>
                     return <Column
                        columnKey={col}
                        key={idx}
                        minWidth={25}
                        width={columnWidths[col] || 25}
                        flexGrow={undefined == columnWidths[col] ? 1 : 0}
                        isResizable={true}
                        header={header} cell={cell} />
                  })}

               </Table>
            </Col>
         </Row>
      )
   }

   handleColValueChange(ev) {
      this.setState({addColValue: ev.target.value})
   }

   handleColValueClick(ev, option) {
      this.setState({
         cols: _.uniq(this.state.cols.concat([option])),
         addColValue: ""
      })
   }

   removeCol(col) {
      this.setState({cols: _.without(this.state.cols, col)})
   }
}

Mixin(Query.prototype, LensedStateDefaultMixin)
