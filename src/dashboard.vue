<style lang="css">
#networks-list.select-list > ul > li {
	padding: 0;
}
#networks-list.select-list > ul > li.create-network {
	padding: 7px 15px 4px;
}
#networks-list.select-list li > span {
	font-weight: bold;
	border-left: 2px solid #333;
	padding: 7px 10px 5px;
	margin-bottom: 10px;
	display: inline-block;
}

.network-selector .page-header h6 {
	line-height: 26px
}
</style>

<template lang="html">
<div>
		<div class="container-fluid">
			<div class="row subbar">
				<div class="col-xs-12">
					<ul class="nav nav-pills">
						<li
							v-show="network.key"
							class="head">
							<a v-link="/dashboard">
								<span class="glyphicon glyphicon-list">&nbsp;</span>
								Dashboard
							</a>
						</li>

						<li
							v-show="!network.key"
							class="head">
							<a v-link="/dashboard?create=true">
								<span class="glyphicon glyphicon-edit">&nbsp;</span>
								Create Network
							</a>
						</li>

						<li
							v-show="network.key"
							v-class="active: 'overview' === tab">
								<a v-link="/dashboard/{{network.key}}/overview">
								<span class="glyphicon glyphicon-pencil">&nbsp;</span>
								Overview
								</a>
						</li>
						<li
							v-show="network.key"
							v-class="active: 'devices' === tab">
								<a v-link="/dashboard/{{network.key}}/devices">
								<span class="glyphicon glyphicon-th-list">&nbsp;</span>
									Devices
								</a>
						</li>
						<li
							v-show="network.key"
							v-class="active: 'setup' === tab">
							<a v-link="/dashboard/{{network.key}}/setup">
								<span class="glyphicon glyphicon-wrench">&nbsp;</span>
								Setup Guide
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div v-component="wb-notify" v-ref="notify" id="notify"></div>

		<div class="cache-meta" v-if="networks.$cachekey">
			Cached until {{networks.$cachettl}}
			<a v-on="click: $root.purgecache(networks)">force reload</a>
		</div>

		<router-view id="dashboard" class="container-fluid sub-view" v-transition="defaulttransition" transition-mode="out-in"></router-view>

</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	store = require('store')

module.exports = {
	data: function() {
		return {
			tab: 'landing',
			network: client.network.get({future: true}),
			networkPatch: { },
			networkPromise: undefined,
		}
	},

	created: function() {
		app.$set('containercss', "has-subbar")
	},

	attached: function() {
		var updateRouteState = function(newval, old) {
			//if (!this.route.params.network)
			//	this.network = {}

			var parts = newval.split(/[/?]/)
			if (parts[2])
				this.tab = parts[3] || 'overview'
			else
				this.tab = 'landing'

			if (this.route.params.network) {
				this.network = client.network.get(
					{auth: this.$root.$.auth.data},
					this.network,
					{key: this.route.params.network}
				)

				this.$root.$.loader.await(this.network.$promise)
			} else {
				this.network = {}
			}
		}.bind(this)

		this.$watch('route.path', updateRouteState)

		updateRouteState(this.route.path, undefined)
	},

	components: {
		'dashboard-landing': require('./dashboard/landing.vue'),
		'dashboard-overview': require('./dashboard/overview.vue'),
		'dashboard-devices': require('./dashboard/devices.vue'),
		'dashboard-permissions': require('./dashboard/permissions.vue'),
		'dashboard-setup-guide': require('./dashboard/setup-guide.vue')
	},

	methods: {
		save: function(network, e) {
			e.preventDefault();

			var qopts = { key: this.route.params.network };

			// this.device.$promise not available, use returned promise
			this.networkPromise = this.network.$update(
				{auth: this.$root.$.auth.data},
				network,
				qopts).$promise

			this.networkPromise.then(function(network) {
				this.$.notify.set('Network was successfully updated', 'success')

				this.$root.$.data.$set('network', network);
				this.networkPromise = undefined
				this.networkPatch = {}
				this.network = network
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$.notify.set('Failed to update network: ' + msg, 'danger')
				this.networkPromise = undefined
			}.bind(this));

			this.$root.$.loader.await(this.networkPromise)
		}
	},

	computed: {
		networks: function() {
			return this.$root.$.data.networks
		}
	}
}
</script>
