<style lang="css">
</style>

<template lang="html">
		<div class="container">
			<div class="row main">
				<div class="col-xs-12">
					<ul class="nav nav-pills">
						<li class="head">
							<a href="#/dashboard/{{params.network}}">
								<span class="glyphicon glyphicon-chevron-left">&nbsp;</span>
								Network &ndash; {{params.network}}
							</a>
						</li>
						<li v-class="active: '' === params.tab || 'overview' === params.tab"><a href="#/device/{{params.network}}/{{params.device}}">Overview</a></li>
						<li v-class="active: 'config' === params.tab"><a href="#/device/{{params.network}}/{{params.device}}/config">Configuration</a></li>
						<!--<li v-class="active: 'query' === params.tab"><a href="#/device/{{params.network}}/{{params.device}}/query">Query</a></li>-->
						<li v-class="active: 'interact' === params.tab"><a href="#/device/{{params.network}}/{{params.device}}/interact">Console</a></li>
					</ul>
				</div>
			</div>

			<div class="page-header">
				<h3>{{device.name || "Unnamed device"}}</h3>
			</div>

			<div v-if="!device['proto/tm']" class="row">
				<p class="lead text-center">
					I can't find that device... Are you sure you put it the right address? If not try to 
				</p>
			</div>
			<div v-if="device['proto/tm']" v-component="device-{{params.tab}}"> </div>
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
	app.$set('view', 'device');
	app.$.data.$set('params.network', args.nid)
	app.$.data.$set('params.device', args.device)
	app.$.data.$set('params.tab', args.tab || "overview")
}

module.exports = {
	init: function() {
		Finch.route('/device/:nid/:device', route)
		Finch.route('/device/:nid/:device/:tab', route)
		return this;
	},
	components: {
		'device-overview': require('./device/overview.vue'),
		'device-config': require('./device/config.vue'),
	},
	compiled: function() {
		this.$root.$.data.networks.$promise.then(function() {
			client.device.get(
				{auth: this.$root.$.auth.data},
				this.device,
				{
					network: this.$root.$.data.params.network,
					key: this.$root.$.data.params.device
				}
			).$promise.then(function(device) {
				if ([] === device['proto/tm'] || Object.keys(device['proto/tm']).length === 0)
					device['proto/tm'] = {
						config: {
							device: {
								part: '',
								fw_revision: '',
								hw_revision: '',
							}
						}
					}

				this.$set('device', device)
			}.bind(this));
		}.bind(this));
	},
	data: function() {
		return {
			device: { },
			devicepatch: { },
			devicePromise: undefined
		}
	},
	methods: {
		save: function(device, e) {
			e.preventDefault();

			var qopts = {
				network: this.params.network,
				key: this.params.device
			};

			// this.device.$promise not available, use returned promise
			this.devicePromise = this.device.$update({auth: this.$root.$.auth.data}, device, qopts).$promise
			this.devicePromise.then(function(device) {
				this.$root.$.notify.set('Device was successfully updated', 'success')

				if ([] === device['proto/tm'] || Object.keys(device['proto/tm']).length === 0)
					device['proto/tm'] = {
						config: {
							device: {
								part: '',
								fw_revision: '',
								hw_revision: '',
							}
						}
					}

				this.$set('device', device);
				this.devicePromise = undefined
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$root.$.notify.set('Failed to update device: ' + msg, 'danger')
				this.devicePromise = undefined
			}.bind(this));
		},
	},
	computed: {
		params: function() {
			return this.$root.$.data.params
		}
	}
};
</script>