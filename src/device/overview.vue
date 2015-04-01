<style lang="css">
	.dropdown-control:hover > .dropdown-menu, .dropdown-menu:hover {
		display: block;
	}

	.dropdown-control:focus > .dropdown-menu,
	.dropdown-control:active > .dropdown-menu {
		display: block;
	}
	.dropdown-control > .dropdown-menu { margin-top: -1px; }

</style>
<template lang="html">
	<div class="device-overview">
			<div class="page-header">
				<h3>{{device.name || "Unnamed device"}}</h3>
			</div>
			<div class="row">
				<form name="device" role="form" class="form form-horizontal container-fluid">
					<div class="col-xs-6">
						<div class="form-group">
								<label class="col-xs-4 control-label">Device Name</label>
								<div class="col-xs-8">
									<input
												v-model="devicePatch.name | patcher device.name"
												type="text"
												class="form-control"
												id="network-name"
												name="network-name"
												placeholder="Device name"/>
								</div>
						</div>

						<div class="form-group">
								<label class="col-xs-4 control-label">Device Key</label>
								<div class="col-xs-8">
									<p class="form-control-static">
										{{device.key}}
									</p>
								</div>
						</div>

						<div class="form-group">
								<label class="col-xs-4 control-label">Device Type</label>
								<div class="col-xs-8">
									<select
										v-model="devicePatch.type | patcher device.type"
										options="availableDeviceTypes"
										id="device-type"
										name="device-type"
										class="form-control">
									</select>
								</div>
						</div>
					</div>
					<div class="col-xs-6">
						<div>
							<label class="col-xs-4 control-label">UID</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									<span v-wb-address="device.address" wb-address-endian="little">00 : 00 : 00 : 00</span>
								</p>
							</div>
						</div>

						<div>
								<label class="col-xs-4 control-label">Part Number</label>
								<div class="col-xs-8">
								<p class="form-control-static">
									{{device['proto/tm'].config.device.part || "not available"}}
								</p>
								</div>
						</div>

						<div>
								<label class="col-xs-4 control-label">Hardware Revision</label>
								<div class="col-xs-8">
									<p class="form-control-static">
										{{device['proto/tm'].hw || device['proto/tm'].config.device.hw_revision || "not available"}}
									</p>
								</div>
						</div>

						<div>
							<label class="col-xs-4 control-label">Firmware Revision</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									{{device['proto/tm'].fw || device['proto/tm'].config.device.fw_revision || "not available"}}
								</p>
							</div>
						</div>

						<div>
							<label class="col-xs-4 control-label">Last Message</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									<span v-if="msgs.length > 0">
										<span v-wb-fuzzy-date="msgs[msgs.length - 1].datetime"></span>
										<span>&ndash; {{msgs[msgs.length - 1].datetime}}</span>
									</span>
									<span v-if="msgs.length === 0 && device.meta.msg.last && device.meta.msg.last.date">
										<span v-wb-fuzzy-date="device.meta.msg.last.date">Unknown</span>
										<span>&ndash; {{device.meta.msg.last.date}}</span>
									</span>
									<span
										v-if="msgs.length === 0 && (!device.meta.msg.last || !device.meta.msg.last.date)">Unknown</span>
								</p>
							</div>
						</div>
					</div>

					<div>
						<div class="col-sm-offset-8 col-sm-4">
							<button
								v-on="click: save(devicePatch, $event)"
								v-attr="disabled: $parent.devicePromise"
								v-class="'btn-spinner': $parent.devicePromise"
								class="btn btn-success">

								<span v-wb-spinner="$parent.devicePromise"></span>

								<span v-if="$parent.devicePromise">Saving changes</span>
								<span v-if="!$parent.devicePromise">Save changes</span>
							</button>
						</div>
					</div>
				</form>
			</div>

		<hr />
		<div class="row section">
			<div class="container-fluid tabhead">
				<ul class="nav nav-pills col-xs-10">
					<li v-class="active: !params.action || params.action === 'gpio'"><a href="#/device/{{params.network}}/{{device.key}}/overview?action=gpio">GPIO Status</a></li>
					<li v-class="active: params.action === 'serial'"><a href="#/device/{{params.network}}/{{device.key}}/overview?action=serial">Serial Communication</a></li>
					<li v-class="active: params.action === 'packets'"><a href="#/device/{{params.network}}/{{device.key}}/overview?action=packets">Send Packets</a></li>
				</ul>
				<div class="col-xs-2" title="Real-time sync streams data from the network and updates in place">
					<div class="label label-success" v-if="streamQuery">
						<span class="glyphicon glyphicon-ok"></span>
						Real-time sync
					</div>

					<div class="label label-warning" v-if="null === streamQuery">
						<span class="glyphicon glyphicon-refresh"></span>
						Real-time sync (reconnecting)
					</div>

					<div class="label label-danger" v-if="undefined === streamQuery">
						<span class="glyphicon glyphicon-remove"></span>
						Real-time sync
					</div>
				</div>
			</div>

			<div
				class="container-fluid"
				v-if="!params.action || params.action === 'gpio'"
				v-component="gpio"
				v-with="device: device, msgs: msgs, params: params"
				></div>

			<div
				class="container-fluid"
				v-if="params.action === 'serial'"
				v-component="serial"
				v-with="device: device, msgs: msgs, params: params"
				></div>

			<div
				class="container-fluid"
				v-if="params.action === 'packets'"
				v-component="packets"
				v-with="device: device, msgs: msgs, params: params"
				></div>

		</div>
	</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

module.exports = {
	data: function() {
		return {
			streamQuery: undefined,

			msgs: [],

			pwmOutput: 100,
		}
	},

	components: {
		'gpio': require('./overview/gpio.vue'),
		'serial': require('./overview/serial.vue'),
		'packets': require('./overview/packets.vue')
	},

	ready: function() {
		this.initiateStream()
	},

	methods: {
		save: function(device, e) {
			this.$parent.save.call(this, device, e);
		},

		initiateStream: function() {
			this.$parent.$.notify.clear();
			var stream = client.message.stream(
				{
					auth: this.$root.$.auth.data,
					evhandlers: {
						msg: function(msg) {
							if (msg['proto/tm'] && msg['proto/tm'].detail) {
								var shift = 20 - this.msgs.length

								for (var i = 0; i < shift; i++)
									this.msgs.shift()

								this.msgs.push(msg)
							}

							this.$broadcast('data:msg:device', msg)

						}.bind(this),

						error: function(err) {
							if (err) {
								if (EventSource.CONNECTING === err.target.readyState) {
									this.$parent.$.notify.set('Device stream disconnected, trying to reconnect', 'info')
									this.streamQuery = null
								} else if (EventSource.CLOSED === err.target.readyState) {
									this.$parent.$.notify.set('Device stream disconnected', 'warning')
									this.streamQuery = undefined
								}
							}
						}.bind(this),

						open: function(e) {
							this.$set('streamQuery', stream)
						}.bind(this),
					}
				},
				null,
				{
					'network': this.params.network,
					'device': this.params.device,
					'date.from': 'NOW',
					'data-encoding': 'hex',
					'accept': 'application/json',
					'query': 'raw>0', // only return actual messages
					'stream': 'stream/' + this.params.network + '/' + this.params.device,
				}
			);
		},

		sendSerial: function(ev) {
			ev.preventDefault()
			if (!ev.shiftKey)
				 this.serialInput = this.serialInput.replace(/\n$/, '')

			return false
		}
	},

	computed: {
		params: function() {
			return this.$root.$.data.params;
		},

		device: function() {
			return this.$parent.device;
		},

		devicePatch: function() {
			return this.$parent.devicePatch;
		},

		availableDeviceTypes: function() {
			if (!this.$root.$.data.network)
				return [];

			return _.map(this.$root.$.data.network.types, function(v, k) {
				return {text: v.name || k, value: k};
			});
		},

		serialOutput: function() {
			var data = []
			return [
				" >> Serial console, send some data or just wait for data to be received",
				" >> Make sure to select the input type, HEX or ASCII!\n\n"
			]
			.concat(data)
			.join("\n");
		}
	}
};
</script>
