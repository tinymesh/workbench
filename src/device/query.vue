<style lang="css">
.filtersOutput {
	margin: -5px 0px 0px 15px;
	padding: 0px;
	border: 1px solid #ddd;
	position: absolute;
	min-width: 75%;
	background: #fff;
}
.filtersOutput li {
	list-style: none;
	padding: 0;
}
.filtersOutput li a {
	display: inline-block;
	padding: 7px 15px 4px;
	border-bottom: 1px solid #eaeaea;
	width: 100%;
}

.filtersOutput .highlight {
	font-weight:  bold;
}

.select-list ul {
	padding: 0px;
}
.select-list li {
	list-style: none;
	padding: 7px 15px 4px;
	border-bottom: 1px solid #eaeaea;
}
.select-list li a {
	color: #636d74;
}
.select-list li.active a {
	color: #52bad5;
	font-weight: bold;
}
.select-list .filters li a {
	font-weight: bold;
}
.select-list .mute {
	color: #777;
}

.action {
	margin-top: 15px;
}
</style>

<template lang="html">
	<div class="container-fluid">
		<div class="col-xs-3 aside">
			<div class="action">
				<button
					v-on="click: doQuery(query, $event)"
					v-attr="disabled: queryPromise"
					v-class="'btn-spinner': queryPromise"
					class="btn btn-primary">

					<span v-wb-spinner="queryPromise"></span>
					<span v-if="!queryPromise" class="glyphicon glyphicon-search">&nbsp;</span>

					<span v-if="queryPromise">Running Query</span>
					<span v-if="!queryPromise">Run Query</span>
				</button>
				<button
					v-on="click: streamQuery ? stopStreamQuery($event) : doStreamQuery(query, $event)"
					v-class="'btn-spinner': streamQuery"
					class="btn btn-info">

					<span v-wb-spinner="streamQuery"></span>
					<span v-if="!streamQuery" class="glyphicon glyphicon-random">&nbsp;</span>

					<span v-if="streamQuery">Streaming (click to stop)</span>
					<span v-if="!streamQuery">Stream Query</span>
				</button>
			</div>

			<div class="time-selector">
				<div class="page-header">
					<h6>Query Range</h6>
				</div>
				<div class="select-list">
					<ul>
						<li v-repeat="range: timeRanges" v-class="active: range.key === query.range.key">
							<a v-on="click: setRange(range, $event)">{{range.text || 'Custom'}}</a>
							<div v-if="range.custom" v-show="range.key === query.range.key">
								<label for="query-input-from">From</label>
								<input
									v-model="query.from"
									type="datetime-local"
									id="query-input-from"
									class="form-control"/>
								<label for="query-input-to">To</label>
								<input
									v-on="change: log($event)"
									v-model="query.to"
									type="datetime-local"
									id="query-input-to"
									class="form-control"/>
								<label for="query-input-to">Timezone</label>
								<input
									type="text"
									id="query-input-tz"
									class="form-control"
									v-model="query.timezone"
									disabled
									placeholder="timezone" />
							</div>
						</li>
					</ul>
				</div>
			</div>
			<div class="sorting">
				<div class="page-header">
					<h6>Order By</h6>
				</div>
				<p class="muted">
					<b>Order By:</b> <code>`{{result.orderBy}}`</code><br>
					<b>Reverse?:</b> <code>`{{result.reverse}}`</code>
				</p>
			</div>
			<div class="query-filters">
				<div class="page-header">
					<h6>Filter Results</h6>
				</div>
				<div class="filters">
					<div class="add-filter">
						<div class="form-group">
							<input
								v-model="filtersInput"
								v-on="keyup: addFilter(filtersInput, $event) | key enter"
								class="form-control" />
							<ul class="filtersOutput" v-show="filtersInput">
								<li v-repeat="item: filtersOutput">
									<a
										v-on="click: addFilter(item, $event)"
										v-html="item | highlight filtersInput"></a>
								</li>
							</ul>
						</div>
						<div class="select-list">
							<ul class="filters">
								<li v-repeat="filter: filters">
									<a v-on="click: removeFilter(filter, $event)">
										{{filter}}
										<span class="pull-right">&times;</span>
									</a>
								</li>
								<li v-repeat="(x=[]).length = Math.max(3 - (filters.length ? filters.length : 3), 0);x">
									<span class="dummy-block">&nbsp;</span>
								</li>
							</ul>
							<p v-if="0 === filters.length" class="mute">
								No filters used, you should atleast add
								<a v-on="click: addFilter('key', $event)">`key`</a>,
								<a v-on="click: addFilter('datetime', $event)">`datetime`</a> or
								<a v-on="click: addFilter('proto/tm.type', $event)">`key`</a> to your query.
							</p>

						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="col-xs-9">
			<div class="page-header">
				<h6>Results</h6>
			</div>
			<table class="table">
				<tr>
					<th v-repeat="k: filters">
						<a v-on="click: setOrderBy(k)">{{k}}</a>
					</th>
				</tr>
				<tr v-repeat="item: result.result | orderBy result.orderBy result.reverse">
					<td v-repeat="k: filters">{{get(k, item)}}</td>
				</tr>
				<tr v-repeat="(x=[]).length = Math.max(10 - result.result.length, 0);x">
					<td v-repeat="k: filters">
						<span class="dummy-block">&nbsp;</span>
					</td>
				</tr>
			</table>
		</div>
	</div>
</template>

<script lang="js">

tzdata = require('moment-timezone/data/packed/latest.json')
var
	client = require('tinymesh-cloud-client'),
	store = require('store')
	tzdata = require('../jstz.min').jstz

var tz = tzdata.determine().name()

var hints = _.union(
	store.get('device.query.hints') || [],
	[
		'datetime',
		'key',
		'selector',
		'channel',
		'raw',
		'proto/tm',
	]
)

var autocomplete = function(input, hints) {
	var reg = new RegExp(input.split('').join('\\w*').replace(/\W/, ""), 'i');
	return hints.filter(function(v) {
		if (v.match(reg)) {
			return v;
		}
	});
}

module.exports = {
	data: function() {
		return {
			query: {
				from: null,
				to: null,
				timezone: tz,
				range: {
					from: 'NOW//-5MINUTE',
					to: 'NOW',
					key: 'last-5min'
				},
			},

			filters: ['datetime', 'key', 'proto/tm.type'],
			filtersInput: "",

			queryPromise: undefined,
			streamQuery: undefined,

			result: {
				result: [],
				meta: {},
				orderBy: 'datetime',
				reverse: true
			}
		}
	},
	filters: {
		highlight: {
			read: function(input, match) {
				return input.replace(new RegExp("(" + this.$get(match) + ")"), '<span class="highlight">$1</span>')
			}
		}
	},
	methods: {
		addFilter: function(val, ev) {
			ev.preventDefault()
			this.filters.push(val || this.filtersInput)
			this.filtersInput = '';
		},

		removeFilter: function(val, ev) {
			ev.preventDefault()
			this.filters = _.without(this.filters, val)
		},

		setRange: function(range, ev) {
			ev.preventDefault()
			this.query.range = range
			this.$log()
		},

		addHints: function(result) {
			_.each(result, function(v) {
				hints = _.union(
					hints,
					Object.keys(v),
					_.map(Object.keys(v['proto/tm']),
						function(v) { return 'proto/tm.' + v })
				)
			})

			store.set('device.query.hints', hints)
		},

		doQuery: function(query, ev) {
			ev.preventDefault();
			this.queryPromise = client.message.query(
				{auth: this.$root.$.auth.data},
				null,
				{
					'network': this.route.params.network,
					'device': this.route.params.device,
					'date.from': this.query.range.from,
					'date.to': this.query.range.to,
					'data-encoding': 'binary'
				}
			).$promise;

			this.$root.$.loader.await(this.queryPromise)

			this.queryPromise.then(
				function(result) {
					this.queryPromise = undefined
					this.result.meta = result.meta
					this.result.result = result.result

					// add autocomplete hints
					this.addHints(result.result)
				}.bind(this),
				function(err) {
					this.queryPromise = undefined
				}.bind(this));
		},

		doStreamQuery: function(query, ev) {
			ev.preventDefault();

			this.$parent.$.notify.clear()
			this.streamQuery = client.message.stream(
				{
					auth: this.$root.$.auth.data,
					evhandlers: {
						msg: function(msg) {
							this.result.result.push(msg)
							// add autocomplete hints
							this.addHints([msg])
						}.bind(this),
						error: function(err) {
							this.$parent.$.notify.set('Could not perform query, an unknown error occured', 'danger')
							this.streamQuery = undefined
						}.bind(this),
					}
				},
				null,
				{
					'network': this.route.params.network,
					'device': this.route.params.device,
					'date.from': this.query.range.from,
					'data-encoding': 'binary',
					'accept': 'application/json',
					'query': 'raw>0', // only return actual messages
					'stream': 'stream/' + this.route.params.network + '/' + this.route.params.device,
				}
			);
		},

		stopStreamQuery: function(ev) {
			ev.preventDefault()

			this.streamQuery.evhandler.close()
			this.streamQuery = undefined
			this.$parent.$.notify.set('Streaming query was stopped', 'info')
		},

		get: function(k, item) {
			_.each(k.split(/\./), function(path) {
				item = item[path]
			})

			return item
		},

		setOrderBy: function(orderBy) {
			if (orderBy.match(/\//))
				orderBy = _.map(orderBy.split(/\./), function(val) {
					return val.match(/\//) ? '[\'' + val + '\']' : val
				}).join('.')

			if (orderBy === this.result.orderBy)
				this.result.reverse = !this.result.reverse

			this.result.orderBy = orderBy
		}

	},
	computed: {
		params: function() {
			return this.$root.$.data.params;
		},

		device: function() {
			return this.$parent.device;
		},

		filtersOutput: function() {
			return _.union(
				this.filtersInput ? [this.filtersInput] : [],
				autocomplete(this.filtersInput, hints)).slice(0,6)
		},

		timeRanges: function() {
			return [
				{key: 'last-5min', from: 'NOW//-5MINUTE',   to: 'NOW', text: 'Last 5 minutes'},
				{key: 'last-15min', from: 'NOW//-15MINUTE',  to: 'NOW', text: 'Last 15 minutes'},
				{key: 'last-30min', from: 'NOW//-30MINUTE',  to: 'NOW', text: 'Last 30 minutes'},
				{key: 'last-1hour', from: 'NOW//-1HOUR',  to: 'NOW', text: 'Last hour'},
				{key: 'last-2hour', from: 'NOW//-2HOUR',  to: 'NOW', text: 'Last 2 hour'},
				{key: 'last-6hour', from: 'NOW//-6HOUR',  to: 'NOW', text: 'Last 6 hours'},
				{key: 'last-12hour', from: 'NOW//-12HOUR', to: 'NOW', text: 'Last 12 hours'},
				{key: 'last-24hour', from: 'NOW//-24HOUR', to: 'NOW', text: 'Last 24 hours'},
				{key: 'custom', from: this.query.from, to: this.query.to, text: null, custom: true}
			]
		}
	}
}
</script>
