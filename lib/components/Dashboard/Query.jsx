import React from 'react'
import Mixin from 'react-mixin'
import {LensedStateDefaultMixin} from '../../mixin'
import _ from 'lodash'

import {QueryStream} from './QueryStream.jsx'
import {QueryStore} from './QueryStore.jsx'

import {Row, Col} from 'react-bootstrap'
import {Input, Button, Label, Glyphicon} from 'react-bootstrap'

import {Table, Column, Cell} from 'fixed-data-table'

import Spinner from 'react-spinkit'
import {AddressEncoder, Loading, Notify} from '../../ui'
import {Autocomplete, AutocompleteOptionsStore} from '../../ui'

var findPath = function(obj, path) {
  path = path || ""
  return _.reduce(obj, function(acc, v, k) {
    return _.isObject(v)
      ? acc.concat(findPath(v, path + "." + k))
      : acc.concat( (path + "." + k).replace(/^./, ''))
  }, [])
}

let autocompleteOptions = new AutocompleteOptionsStore()

export class Query extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         'resources': [],
         'date-from': "",
         'date-to': "",
         'continuous': false,
         'query': "",

         querystream: null,
         queryStore: new QueryStore(),
         columnWidths: {},
         cols: ['datetime', 'proto/tm.type', 'proto/tm.detail'],

         addColValue: "",
         sorting: ["datetime", false],
         boundingRect: {
           height: 100,
           width:  250,
           top:    null,
           bottom: null,
           left:   null,
           right:  null
         },
         parentRect: {
           height: 100,
           top:    null,
           bottom: null,
           left:   null,
           right:  null
         }
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

      this.state.queryStore.addChangeListener( this._queryStoreChangeHandler = () => {
         this.forceUpdate()
      })
   }

   componentDidMount() {
      this.updateRectState()
      window.addEventListener('resize', this._listener = () => this.updateRectState());
   }

   componentWillUnmount() {
      this._mounted = false
      this._notify = null
      window.removeEventListener('resize', this._listener)
      this.state.queryStore.removeChangeListener( this._queryStoreChangeHandler )
   }

   updateRectState() {
      let {autosize} = this.refs

      this.setState({
         boundingRect: autosize.getDOMNode()
                               .getBoundingClientRect(),
         parentRect: autosize.getDOMNode()
                             .parentNode
                             .getBoundingClientRect()
      })
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
      this._notify.clear

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

      this.state.queryStore.clear()

      let res = new QueryStream({
         'date.from':  this.state['date-from'],
         'date.to':    this.state['date-to'],
         'continuous': this.state.continuous,
         'query':      this.state.query,
         'uri':        resource,
      })

      res.on('error',     (err) => {
         if (!err && this.state.querystream)
            this.state.querystream && this.state.querystream.close()

         this._notify.add(
            <span><Glyphicon glyph="warning-sign" /> Query failed: {err.error || err.message}</span>,
            'danger'
         )
      })
      res.on('complete',  () => this.setState({querystream: null}))
      res.on('data',      (data) => {
         // skip initial return
         if (data.meta || 'ping' === data)
            return

          // add to col value autocomplete
         autocompleteOptions.add.apply(autocompleteOptions, findPath(data))

         this.state.queryStore.add(data)
      })

     this.setState({querystream: res})
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
      let {boundingRect, parentRect} = this.state
      let {cols, columnWidths, addColValue, colValues} = this.state
      let {queryStore} = this.state


      let sizeWithPadding = Math.max(
         queryStore.length,
         Math.floor(parentRect.height / 25))

      return (
         <Row className="query">
            <Col xs={4} md={3} className="aside">
               <div className="datasource-select">
                  {_.map(this.state.resources, (resource, idx) => {
                     switch (resource[0]) {
                        case "network":
                           return <span key={idx} className="btn btn-disabled btn-sm btn-default">network/{resource[1].key}</span>
                        case "device":
                           return <span key={idx} className="btn btn-disabled btn-sm btn-default">device/{resource[1].network}/{resource[1].key}</span>
                     }
                  })}

                  <hr />
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

                  <hr />
               </div>

               <div className="pick-cols">
                  <div className="form-group">
                     <label>Pick columns</label>
               	   <Autocomplete
						   	placeholder="Add column"
						   	store={autocompleteOptions}
						   	filter={(option) => -1 === cols.lastIndexOf(option)}
						   	onSelect={(ev, option) => this.addCol(option)} />
                  </div>
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
            <Col xs={8} md={9} className="query" ref="autosize">
               <Notify store={this._notify} />

               <Table
                 rowHeight={25}
                 rowsCount={sizeWithPadding}
                 headerHeight={35}
                 width={boundingRect.width - 25}
                 height={parentRect.height}
                 onColumnResizeEndCallback={this._onColumnResizeEndCallback}
                 isColumnResizing={false}
                 {...this.props}>

                  {_.map(cols, (col, idx) => {
                     let path = col.split('.')

                     let cell = ({columnKey, rowIndex, ...props}) => {
                        return (
                        <Cell {...props}>
                           {_.get(queryStore.at(rowIndex), columnKey)}
                        </Cell>
                        )
                     }

                     let header = <Cell>
                        <a onClick={() => this.sortCol(col)}>{col}</a> <a onClick={() => this.removeCol(col)} className="pull-right">x</a>
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

               <p className="text-right">
                  Rows: <span>{ queryStore.length }</span>
               </p>
            </Col>
         </Row>
      )
   }

   addCol(col) {
      this.setState({
         cols: _.uniq(this.state.cols.concat([col])),
      })
   }

   removeCol(col) {
      let
         newcols = _.without(this.state.cols, col),
         patch = {cols: newcols}

      // reset sorting if we are removing the column
      if (this.state.sorting[0] === col)
         patch.sorting = [newcols[0] || "datetime", false]

      this.setState(patch)
   }

   sortCol(col) {
      let order = false

      if (col === this.state.sorting[0])
         order = !this.state.sorting[1]

      this.state.queryStore.sort([col], [order])
      this.setState({sorting: [col, order]})
   }
}

Mixin(Query.prototype, LensedStateDefaultMixin)
