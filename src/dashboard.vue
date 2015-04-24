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
			<div class="row subbar" v-if="!params.network || network">
				<div class="col-xs-12">
					<ul class="nav nav-pills">
						<li
							class="head">
							<a href="#/dashboard">
								<span class="glyphicon glyphicon-edit">&nbsp;</span>
								Create Network
							</a>
						</li>

						<li
							v-show="network"
							v-class="active: '' === params.tab || 'overview' === params.tab">
								<a href="#/dashboard/{{params.network}}/overview">
								<span class="glyphicon glyphicon-pencil">&nbsp;</span>
								Overview
								</a>
						</li>
						<li
							v-show="network"
							v-class="active: 'devices' === params.tab">
								<a href="#/dashboard/{{params.network}}/devices">
								<span class="glyphicon glyphicon-th-list">&nbsp;</span>
									Devices
								</a>
						</li>
						<li
							v-show="network"
							v-class="active: 'permissions' === params.tab">
								<a href="#/dashboard/{{params.network}}/permissions">
								<span class="glyphicon glyphicon-lock">&nbsp;</span>
									Permissions
								</a>
						</li>
						<li
							v-show="network && !network.haveConnected()"
							v-class="active: 'setup-guide' === params.tab">
							<a href="#/dashboard/{{params.network}}/setup-guide">
								<span class="glyphicon glyphicon-wrench">&nbsp;</span>
								Setup Guide
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div v-component="wb-notify" v-ref="notify" id="notify"></div>

		<div class="container-fluid">
			<div
				class="col-xs-3"
				v-if="(params.tab === 'overview' || params.tab === 'permissions' || params.tab === 'setup-guide') && (!$root.$.data.initialSetup || skipSetupGuide)">
				<div class="network-selector">
					<div class="page-header">
						<h6>Networks</h6>
					</div>
					<div class="select-list" id="networks-list">
						<ul v-if="networks">
							<li v-repeat="netGroup: networkGroups" class="parent" v-class="active: net && net.key === params.network">
								<span>{{netGroup.name}}</span>
								<ul v-if="networks">
									<li v-repeat="net: netGroup.items" v-class="active: net.key === params.network">
										<a href="#/dashboard/{{net.key}}">{{net.name || 'Unnamed Network'}} ({{net.key}})</a>
									</li>
								</ul>
							</li>
							<li v-class="active: undefined == params.network" class="create-network">
								<a href="#/dashboard"><b>+</b> Create new network</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div v-class="
				col-xs-9: !$root.$.data.initialSetup || skipSetupGuide,
				col-xs-12: $root.$.data.initialSetup || !skipSetupGuide
			">
				<div v-if="params.network && !network" class="row">
					<div class="page-header">
						<h3>Where's my network?</h3>
					</div>

					<p class="lead">
						I tried to lookup the network id you provided but i don't
						know where it is.
					</p>
					<p>
						Are you sure the network exists and that you have the
						correct permissions to access the network?
					</p>
				</div>
				<div v-if="!notFound && network" v-component="dashboard-{{params.tab}}"></div>
				<div v-if="!params.network" v-component="dashboard-setup-guide"></div>
			</div>
		</div>
</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	Finch = (require('./vendor/finch')).Finch,
	store = require('store')

var route = function(args) {
	app.$set('view', 'dashboard');
	app.$.data.$set('params.network', args.nid)
	app.$.data.$set('params.tab', args.tab || "overview")

	app.$.data.networks.$promise
		.then(function(networks) {
			var network;
			if (!args.nid && app.$.data.initialSetup) {
				if (network = networks[0]) {
					app.$.data.$set('params.network', networks[0].key)
					Finch.navigate('/dashboard/' + networks[0].key)
				}
			} else if (args.nid) {
				network = _.find(networks, {key: app.$.data.params.network})
				app.$.data.$set('network', network)
				app.$broadcast('data:network', network)
			}

			if (network.key && !args.tab && !network.haveConnected())
				app.$.data.$set('params.tab', 'setup-guide')
		})
}

module.exports = {
	init: function(navigation) {
		Finch.route('/dashboard/:nid', route)
		Finch.route('/dashboard/:nid/:tab', route)

		navigation.methods.add.call(navigation.proxy(), {
			text: 'Dashboard',
			href: '/dashboard',
			auth: true,
			active: [/^\/$/, /^\/dashboard(\/|$)/, /^\/device(\/|$)/],
			icon: 'glyphicon glyphicon-dashboard',
			appendClasses: ['has-subbar']
		})

		return this;
	},

	route: route,

	components: {
		'dashboard-overview': require('./dashboard/overview.vue'),
		'dashboard-devices': require('./dashboard/devices.vue'),
		'dashboard-permissions': require('./dashboard/permissions.vue'),
		'dashboard-setup-guide': require('./dashboard/setup-guide.vue')
	},

	data: function() {
		return {
			networkPatch: { },
			networkPromise: undefined,
		}
	},

	methods: {
		save: function(network, e) {
			e.preventDefault();

			var qopts = { key: this.params.network };

			// this.device.$promise not available, use returned promise
			this.networkPromise = this.$root.$.data.network.$update({auth: this.$root.$.auth.data}, network, qopts).$promise
			this.networkPromise.then(function(network) {
				this.$.notify.set('Network was successfully updated', 'success')

				this.$root.$.data.$set('network', network);
				this.networkPromise = undefined
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$.notify.set('Failed to update network: ' + msg, 'danger')
				this.networkPromise = undefined
			}.bind(this));
		}
	},

	computed: {
		params: function() {
			return this.$root.$.data.params
		},

		notFound: function() {
			return this.$root.notFound = undefined === this.$options.components['dashboard-' + this.params.tab]
		},

		network: function() {
			return this.$root.$.data.network
		},

		networks: function() {
			return this.$root.$.data.networks
		},

		networkGroups: function() {
			if (!this.networks || !this.$root.$.data.user.email)
				return [];

			var user = this.$root.$.data.user;
			var groups = _.groupBy(this.networks, function(net) {
				var forUser = _.any(net.parents, function(v) {
					return 'user/' + user.email === v
				});

				if (forUser)
					return 'user/' + user.email

				return _.filter(net.parents, function(v) {
					return v.match(/^organization\//)
				})[0];
			})

			return _.map(groups, function(networks, k) {
				return {
					name: k,
					items: networks
				}
			}).sort().reverse();
		},
	}
}
</script>
