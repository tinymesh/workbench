<template lang="html">
	<div>
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
						<div class="form-group">
							<label class="col-xs-4 control-label">UID</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									<span v-wb-address="device.address" wb-address-endian="little">00 : 00 : 00 : 00</span>
								</p>
							</div>
						</div>

						<div class="form-group">
								<label class="col-xs-4 control-label">Part Number</label>
								<div class="col-xs-8">
								<p class="form-control-static">
									{{device['proto/tm'].config.device.part || "not available"}}
								</p>
								</div>
						</div>

						<div class="form-group">
								<label class="col-xs-4 control-label">Hardware Revision</label>
								<div class="col-xs-8">
									<p class="form-control-static">
										{{device['proto/tm'].config.device.hw_revision || "not available"}}
									</p>
								</div>
						</div>

						<div class="form-group">
							<label class="col-xs-4 control-label">Firmware Revision</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									{{device['proto/tm'].config.device.fw_revision || "not available"}}
								</p>
							</div>
						</div>
					</div>

					<div class="form-group">
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

		<div class="row section">

			<div class="container-fluid">
				<div class="page-header">
					<h4>GPIO Status</h4>
				</div>

				<div v-if="gpios.length === 0">
					<p class="lead text-center">
						No GPIO configuration found, did you try to fetch the config?
					</p>
				</div>
				<div v-if="gpios.length > 0">
					<div class="col-xs-6" v-repeat="gpio: gpios">
						<div class="col-xs-4">GPIO {{$index}}</div>

						<div class="col-xs-8" v-if="0 === gpio.config">
							<span>Output (high)</span>
						</div>

						<div class="col-xs-8" v-if="1 === gpio.config">
							<span>Input: {{device['proto/tm']['gpio_' + $index] || "no value"}}</span>
						</div>

						<div class="col-xs-8" v-if="2 === gpio.config">
							<span>Analogue Input</span>
						</div>

						<div class="col-xs-8" v-if="3 === gpio.config">
							<span>PWM Output</span>
						</div>

						<div class="col-xs-8" v-if="3 === gpio.config">
							<span>Output (low)</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

module.exports = {
	data: function() {
		return {
			msgStream: undefined
		}
	},

	ready: function() {
		this.initiateStream()
	},

	methods: {
		save: function(device, e) {
			this.$parent.save.call(this, device, e);
		},

		initiateStream: function() {
			var x
			this.$parent.$.notify.clear();
			this.streamQuery = x, client.message.stream(
				{
					auth: this.$root.$.auth.data,
					evhandlers: {
						msg: function(msg) {
							console.log('received message')
						}.bind(this),

						error: function(err) {
							if (err) {
								if (EventSource.CONNECTING === err.target.readyState) {
									this.$parent.$.notify.set('Device stream disconnected, trying to reconnect', 'info')
								} else if (EventSource.CLOSED === err.target.readyState) {
									this.$parent.$.notify.set('Device stream disconnected', 'warning')
									this.streamQuery = undefined
								}
							}
						}.bind(this),

						open: function(e) {
							console.log('open', this)
						}.bind(this),
					}
				},
				null,
				{
					'network': this.params.network,
					'device': this.params.device,
					'date.from': 'NOW',
					'data-encoding': 'binary',
					'accept': 'application/json',
					'query': 'raw>0', // only return actual messages
					'stream': 'stream/' + this.params.network + '/' + this.params.device,
				}
			);
		},
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

		gpios: function() {
			if (!this.device['proto/tm'])
				return []

			var config = this.device['proto/tm'].config
			if (config.gpio_0.config)
				return [
					config.gpio_0, config.gpio_1, config.gpio_2,
					config.gpio_3, config.gpio_4, config.gpio_5,
					config.gpio_6, config.gpio_7]
			else
				return []
		},

		availableDeviceTypes: function() {
			if (!this.$root.$.data.network)
				return [];

			return _.map(this.$root.$.data.network.types, function(v, k) {
				return {text: v.name || k, value: k};
			});
		},
	}
};
</script>
