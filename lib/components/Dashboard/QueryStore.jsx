import { EventEmitter } from 'events'
import _ from 'lodash'

export class QueryStore extends EventEmitter {
   constructor() {
      super()
      this._results = []
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

   add(item) {
      this._results.push(item)
      this.emitChange()
   }

   get length() {
      return this._results.length
   }

   sort(cols, order) {
      return this._results = _.sortByOrder(this._results, cols, order)
   }

   at(index) {
      return this._results[index]
   }

   clear() {
      this._results = []
      this.emitChange()
   }
}
