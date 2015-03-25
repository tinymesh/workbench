<style lang="css">
.row.subbar {
	background: #343d46;
}
.row.subbar li > a {
	color: #fff;
	font-weight: bold;
	padding: 10px 25px 7px;
}

.row.subbar li > a:hover {
	background: #454d57;
	border-bottom: 2px solid #454d57;
}
.row.subbar li.active > a {
	background: #565e68;
	display: inline-block;
	color: #fff;
}
.row.subbar li.head > a {
	background: #232b35;
	display: inline-block;
	color: #fff;
	border-bottom: 2px solid transparent;
}
.row.subbar li.head > a:hover {
	border-bottom: 2px solid #565e68;
}
</style>

<template lang="html">
		<div class="container-fluid">
			<div class="row subbar">
				<div class="col-xs-12">
					<ul class="nav nav-pills">
						<li class="head">
							<a href="#/dashboard/{{params.network}}">
								<span class="glyphicon glyphicon-chevron-left">&nbsp;</span>
								Network &ndash; {{params.network}}
							</a>
						</li>
						<li v-class="active: '' === params.tab || 'overview' === params.tab">
							<a href="#/device/{{params.network}}/{{params.device}}">
								<span class="glyphicon glyphicon-pencil">&nbsp;</span>
								Overview
							</a>
						</li>
						<li v-class="active: 'config' === params.tab">
							<a href="#/device/{{params.network}}/{{params.device}}/config">
								<span class="glyphicon glyphicon-cog">&nbsp;</span>
								Configuration
							</a>
						</li>
						<li v-class="active: 'query' === params.tab">
							<a href="#/device/{{params.network}}/{{params.device}}/query">
								<span class="glyphicon glyphicon-th-list">&nbsp;</span>
								Query
							</a>
						</li>
						<!--<li v-class="active: 'interact' === params.tab"><a href="#/device/{{params.network}}/{{params.device}}/interact">Console</a></li>-->
					</ul>
				</div>
			</div>
		</div>

		<div v-component="wb-notify" v-ref="notify" id="notify"></div>

		<div class="container-fluid">
			<div v-if="error" class="row">
				<p class="lead text-center">
					I can't find that device... Are you sure you put it the right address? If not reload the page!
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

	Finch.observe('action', function(action) {
		app.$.data.$set('params.action', action)
	})
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
		'device-query': require('./device/query.vue'),
	},

	compiled: function() {
		this.$root.$.data.networks.$promise.then(function() {
			var p = client.device.get(
				{auth: this.$root.$.auth.data},
				this.device,
				{
					network: this.$root.$.data.params.network,
					key: this.$root.$.data.params.device
				}
			).$promise

			this.$root.$.loader.await(p)

			p.then(function(device) {
				this.error = false
				if ([] === device['proto/tm'] || Object.keys(device['proto/tm'] || {}).length === 0)
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
			}.bind(this), function(err) {
				this.error = true
				if (403 === err.status) {
					this.$.notify.set('There seems to be an error with the resource, device could not be read', 'danger');
				}
			}.bind(this));

		}.bind(this));
	},

	data: function() {
		return {
			device: { },
			devicePatch: { },
			devicePromise: undefined,
			error: false
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
				this.$.notify.set('Device was successfully updated', 'success')

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
				this.$.notify.set('Failed to update device: ' + msg, 'danger')
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
