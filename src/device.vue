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
<div>
	<div class="container-fluid">
		<div class="row subbar">
			<div class="col-xs-12">
				<ul class="nav nav-pills">
					<li class="head">
						<a v-link="/dashboard/{{route.params.network}}">
							<span class="glyphicon glyphicon-chevron-left">&nbsp;</span>
								Network &ndash; {{route.params.network}}
						</a>
					</li>
					<li v-class="active: 'overview' === tab">
						<a v-link="/device/{{route.params.network}}/{{route.params.device}}">
							<span class="glyphicon glyphicon-pencil">&nbsp;</span>
							Overview
						</a>
					</li>
					<li v-class="active: 'config' === tab">
						<a v-link="/device/{{route.params.network}}/{{route.params.device}}/config">
							<span class="glyphicon glyphicon-cog">&nbsp;</span>
							Configuration
						</a>
					</li>
					<li v-class="active: 'query' === tab">
						<a v-link="/device/{{route.params.network}}/{{route.params.device}}/query">
							<span class="glyphicon glyphicon-th-list">&nbsp;</span>
							Query
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
		<div v-component="wb-notify" v-ref="notify" id="notify"></div>

		<router-view id="device" class="container-fluid sub-view" v-transition="defaulttransition" transition-mode="out-in"></router-view>
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
			tab: 'overview',
			device: { },

			devicePatch: {
				name: '',
				type: ''
			},

			msgs: [],

			devicePromise: undefined,
			stream: undefined,
		}
	},

	components: {
		'device-overview': require('./device/overview.vue'),
		'device-config': require('./device/config-simple.vue'),
		'device-query': require('./device/query.vue'),
	},

	created: function() {
		app.$set('containercss', "has-subbar")
	},

	attached: function() {
		var updateRouteState = function(newval, old) {
			var parts = newval.split(/[/?]/)
			this.tab = parts[4] || 'overview'
		}.bind(this)

		this.$watch('route.path', updateRouteState)

		updateRouteState(this.route.path, undefined)

		if (this.route.params.device) {
			this.device = client.device.get(
				{auth: this.$root.$.auth.data},
				this.device,
				{
					network: this.route.params.network,
					key: this.route.params.device,
				}
			)

			this.$root.$.loader.await(this.device.$promise)
			this.device.$promise.catch(function(err) {
				console.log('device err:', err)
			})
		}

		this.startStream()
	},

	detached: function() {
		this.stream && this.stream.close()
	},

	methods: {
		startStream: function() {
			var stream = client.message.stream(
				{
					auth: this.$root.$.auth.data,
					evhandlers: {
						msg: function(msg) {
							if (this.msgs.length >= 20) {
								this.msgs.reverse()
								this.msgs.length = 19
								this.msgs.reverse()
							}

							this.$broadcast('data:msg:device', msg)

							this.msgs.push(msg)
						}.bind(this),
						error: function(err) {
								if (err) {
									this.$broadcast('stream:close', this.stream)
									if (EventSource.CONNECTING === err.target.readyState) {
										this.$.notify.set('Device stream disconnected, trying to reconnect', 'info')
									} else if (EventSource.CLOSED === err.target.readyState) {
										this.$.notify.set('Device stream disconnected', 'warning')
										this.stream = undefined
									}
								}
							}.bind(this),

							open: function(e) {
								this.stream = stream
								this.$broadcast('stream:open', stream)
							}.bind(this)
						}
					},
					null,
					{
						'network': this.route.params.network,
						'device': this.route.params.device,
						'date.from': 'NOW',
						'data-encoding': 'hex',
						'accept': 'application/json',
						'query': 'raw>0', // only return actual messages
						'stream': 'stream/' + this.route.params.network + '/' + this.route.params.device,
					}
				);
		},

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
	}
}
</script>
