<style lang="css">
	.device-overview .gpio {
		min-height: 3em;
	}
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

			<div class="container-fluid" v-if="!params.action || params.action === 'gpio'">

				<div class="col-xs-12">
					<div v-if="gpios.length === 0">
						<p class="lead text-center">
							No GPIO configuration found, did you try to fetch the config?
						</p>
					</div>

					<div v-if="gpios.length > 0">
						<div class="gpio col-xs-6" v-repeat="gpio: gpios">
							<div class="col-xs-4">GPIO {{$index}}</div>

							<div class="col-xs-8" v-if="0 === gpio.config || 4 === gpio.config">
								<button
									v-on="click: setOutput($index, 1, $event)"
									class="btn btn-sm btn-success">
										Enable
								</button>
								<button
									v-on="click: setOutput($index, 0, $event)"
									class="btn btn-sm btn-primary">
										Disable
								</button>
								<span class="label label-info">Digital Output</span>
							</div>

							<div class="col-xs-8" v-if="1 === gpio.config">
								<span>{{lastStatus['proto/tm'].dio['gpio_' + $index] || "no value"}}</span>
								<span class="label label-info">Digital Input</span>
							</div>

							<div class="col-xs-8" v-if="2 === gpio.config">
								<span>{{lastStatus['proto/tm']['aio' + $index] * 1.25 / 2047 | round 2 | default "No Value"}}</span>
								<span class="label label-info">Analogue Input</span>
							</div>

							<div class="col-xs-8" v-if="3 === gpio.config">
								<div class="col-xs-6">
									<input
										id="pwmoutput"
										type="range"
										min="0"
										max="100"
										step="1"
										v-model="pwmOutput"
										v-on="change: setPWM(pwmOutput, $event)"
										value="{{device['proto/tm'].config.gpio_7.pwm_default || pwmOutput"
										number />
								</div>
								<div class="col-xs-6">
									<span>{{pwmOutput}}%/</span>
									<span class="label label-info">PWM Output</span>
								</div>
							</div>
						</div>
					</div>
					<div class="action text-right">
						<button
							v-on="click: getStatus"
							type="submit"
							class="btn btn-primary">
							Request device status
						</button>
					</div>
				</div>
			</div>

			<div class="container-fluid" v-if="params.action === 'serial'">
				<div class="col-xs-12">

					<pre>{{serialOutput}}</pre>
					<textarea
						v-model="serialInput"
						v-on="keyup:sendSerial | key enter"
						class="form-control" rows="2"></textarea>

					<div class="action">
						<div class="pull-right">
							<label>
								<input v-model="useAck" type="checkbox"> Request acknowledge
							</label>
							&nbsp;

							<div class="btn-group">
								<button type="submit" class="btn btn-default">
									Input type <b>({{serialInputType}})</b>
								</button>
								<button type="submit" class="btn btn-default">
									<span class="caret">&nbsp;</span>
								</button>
							</div>
							<ul class="dropdown-menu" role="menu">
								<li><a href="#">ASCII</a></li>
								<li><a href="#">HEX</a></li>
							</ul>

							<div class="btn-group">
								<button type="submit" class="btn btn-info">
									<span class="glyphicon glyphicon-retweet">&nbsp;</span>
									Send Every (1 second)
								</button>
								<button type="submit" class="btn btn-info">
									<span class="caret"></span>
								</button>
							</div>

							<ul class="dropdown-menu" role="menu">
								<li><a href="#">1 second</a></li>
								<li><a href="#">5 seconds</a></li>
								<li><a href="#">15 seconds</a></li>
								<li><a href="#">60 seconds</a></li>
								<li>
									<div class="input-group">
										<input type="number" class="form-control" placeholder="Custom Time">
										<div class="input-group-addon">seconds</div>
									</div>
								</li>
							</ul>

							<button type="submit" class="btn btn-primary">
								<span class="glyphicon glyphicon-log-in">&nbsp;</span>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>

			<div class="container-fluid" v-if="params.action === 'packets'">
				<div class="col-xs-12">
					I'm packet data....
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
			streamQuery: undefined,

			lastStatus: {'proto/tm': {'dio': {}}},

			pwmOutput: 100,

			serialInput: '',
			serialInputType: 'ASCII',

			useAck: false
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
			this.$parent.$.notify.clear();
			var stream = client.message.stream(
				{
					auth: this.$root.$.auth.data,
					evhandlers: {
						msg: function(msg) {
							if (msg['proto/tm'].dio)
								this.$set('lastStatus', msg)

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
					'data-encoding': 'binary',
					'accept': 'application/json',
					'query': 'raw>0', // only return actual messages
					'stream': 'stream/' + this.params.network + '/' + this.params.device,
				}
			);
		},

		setPWM: function(value, ev) {
			ev.preventDefault()

			value = parseInt(value)

			if (_.isNaN(value)) {
				this.$parent.$.notify.set('Failed to set PWM output', 'danger')
				return
			}

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'set_pwm',
						'pwm': value
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
		},

		setOutput: function(gpio, value, ev) {
			ev.preventDefault()

			value = parseInt(value)

			if (_.isNaN(value)) {
				this.$parent.$.notify.set('Failed to set output: gpio_' + gpio, 'danger')
				return
			}

			var outputs = {}
			outputs["gpio_" + gpio] = !!value
			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'set_output',
						'gpio': outputs
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
		},

		getStatus: function(ev) {
			ev.preventDefault()

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'get_status'
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
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

		gpios: function() {
			if (!this.device['proto/tm'] || !this.device['proto/tm'].config)
				return []

			var config = this.device['proto/tm'].config
			if (config.gpio && config.gpio_0.config)
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
