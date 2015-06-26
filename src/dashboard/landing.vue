<template>
	<div class="container-fluid">
		<div class="row">
			<aside v-show="networks.length > 0" class="col-xs-3">
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
	</div>
</template>

<script lang="js">
var _ = require('lodash')

module.exports = {
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
		networks: function() {
			return this.$root.$.data.networks
		},
	}
}
</script>
