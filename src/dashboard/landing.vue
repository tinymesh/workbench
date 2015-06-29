<template>
	<div class="container-fluid">
		<div class="row" v-if="!route.query.create && 0 === allnetworks.length">
			You have no networks
		</div>

		<div class="col-md-10 col-md-offset-2">
			<div v-if="'true' === route.query.create" v-component="dashboard-setup-guide"></div>
		</div>

		<div class="row" v-if="!route.query.create && allnetworks.length > 0">
			<aside class="col-xs-3">
				<div class="state-filter">
					<div class="page-header">
						<h6>Connectivity</h6>
					</div>

					<div class="select-list" id="connstate-list">
						<ul>
							<li v-repeat="filter.connstate"
									v-class="active: filter.connstate[$key]">
								<a v-on="click: filter.connstate[$key] = !filter.connstate[$key]">{{states[$key]}}</a>
							</li>
				</div>

<!--
				<div class="device-filter">
					<div class="page-header">
						<h6>Device Types</h6>
					</div>

					<div class="select-list" id="device-list">
						<ul>
							<li v-repeat="filter.types">
								<a v-on="click: filter.types[$key] = !filter.types[$key]}}">{{$key}}</a>
							</li>
						</ul>
					</div>
				</div>

				<div class="ownership-filter">
					<div class="page-header">
						<h6>Owned by</h6>
					</div>

					<div class="select-list" id="entity-list">
						<ul>
							<li v-repeat="filter.ownership">
								<a v-on="click: filter.ownership[$key] = !filter.ownership[$key]}}">{{$key}}</a>
							</li>
						</ul>
					</div>
				</div>

-->

			</aside>

			<div v-show="networks.length > 0" class="col-xs-9">
			 <div v-repeat="network: networks">
					<div class="page-header">
						<h4><a v-link="/dashboard/{{network.key}}">{{network.name}}</a></h4>
			 		</div>

					<div class="row">
						<div class="col-xs-5">
							<dl class="dl-horizontal">
								<dt>Gateways Connected</dt>
								<dd>
									<span><em>{{netconnectivity(network).active}} / {{netconnectivity(network).chans}}</em></span>
									&ndash;
									<span v-show="1 === netconnectivity(network).state" class="label label-success">All connected</span>
									<span v-show="0 === netconnectivity(network).state" class="label label-warning">Some disconnected</span>
									<span v-show="-1 === netconnectivity(network).state" class="label label-danger">No connections</span>
									<span v-show="undefined === netconnectivity(network).state" class="label label-default">No gateways</span>
								</dd>

								<dt>Devices</dt>
								<dd>
									<ul>
										<li v-repeat="group: devicesByType(network)">
											<b>{{$key}}</b> {{group.length}}
										</li>
									</ul>
								</dd>
							</dl>
						</div>
						<div class="col-xs-7">
							<ul class="nav nav-pills">
								<li>
									<a v-link="/dashboard/{{network.key}}/overview">
										<span class="glyphicon glyphicon-pencil">&nbsp;</span>
											Overview
									</a>
								</li>
								<li>
										<a v-link="/dashboard/{{network.key}}/devices">
										<span class="glyphicon glyphicon-th-list">&nbsp;</span>
											Devices
										</a>
								</li>
								<li>
										<a v-link="/dashboard/{{network.key}}/permissions">
										<span class="glyphicon glyphicon-lock">&nbsp;</span>
											Permissions
										</a>
								</li>
							</ul>
						</div>
					</div>
			 </div>
			</div>
			<div v-show="0 === networks.length" class="col-xs-9">
				<br >
				<div class="alert alert-info">
					No networks matched your filtering
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="js">
var _ = require('lodash')

module.exports = {
	data: function() {
		return {
			filter: {
				ownership: {},
				types: {},
				connstate: {
					'connected': false,
					'partial-connected': false,
					'disconnected': false,
					'no-gateways': false,
				},
			},
			states: {
				'connected': "All gateways connected",
				'partial-connected': "Some gateways connected",
				'disconnected': "Disconnected",
				'no-gateways': "No gateways",
			}
		}
	},

//	// don't need this now
//	attached: function() {
//		var ctx = this
//
//		this.allnetworks.$promise.then(function(networks) {
//			_.each(networks, function(net) {
//				// populate ownership
//				_.each(net.parents, function(v) {
//					if (undefined === ctx.filter.ownership[v])
//						ctx.filter.ownership.$add(v, -1)
//				})
//
//				// populate types
//				_.each(net.types, function(v, k) {
//					if (undefined === ctx.filter.types[k])
//						ctx.filter.types.$add(k, -1)
//				})
//			})
//		})
//	},

	methods: {
		netconnectivity: function(network) {
			var chans = _.size(network.channels)
			var activechans = _.filter(network.channels, function(chan) {
				return chan.active
			})
			var inactivecount = chans - _.size(activechans)
			var activecount = _.size(activechans)

			var state
			if (0 === chans)
				state = undefined
			else if (chans === activecount)
				state = 1
			else if (activecount > 0)
				state = 0
			else if (0 === activecount)
				state = -1

			return {
				state: state,
				inactive: inactivecount,
				active: activecount,
				chans: chans
			}
		},

		devicesByType: function(network) {
			return _.groupBy(network.devicemap, 'type')
		}
	},

	computed: {
		allnetworks: function() {
			return this.$root.$.data.networks
		},

		networks: function() {
			var ctx = this

			var filterconns = _.any(this.filter.connstate, function(v) { return v; })

			var connmap = {
				"-2": 'no-gateways',
				"-1": 'disconnected',
				 "0": 'partial-connected',
				 "1": 'connected',
			}

			return _.filter(this.allnetworks, function(network) {
				if (!filterconns)
					return true

				var connstate = ctx.netconnectivity(network)
				return true === ctx.filter.connstate[connmap[connstate.state || -2]]
			})
		},
	}
}
</script>
