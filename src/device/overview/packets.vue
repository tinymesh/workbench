<style lang="css">
.mute {
	color: #777;
	}
</style>

<template lang="html">
<div class="container-fluid">
	<div class="col-md-12">
		<div class="container-fluid">
			<div class="page-header" v-if="commands[command]">
				<h6>{{commands[command].name}}</h6>
			</div>

			<div class="row">
				<div class="col-md-12" v-show="!commands[command]">
					<p class="lead">
						Sending command allows you to control GPIO pins, send
						UART data, request the device status and much more.
					</p>
					<p>
						To send a command select one of the commands from the
						left menu, you will get a description of what each command
						does and the option to fill in any arguments.
					</p>
				</div>

				<div class="col-md-7" v-if="commands[command]">
					<p class="lead"
					    v-show="'set_output' !== command && 'set_pwm' !== command && 'set_config' !== command">
						<code>{{commands[command].name}}</code> does not take any additional parameters
					</p>

					<div v-show="'set_output' === command">
						<div v-if="gpios.length === 0">
							<p class="lead text-center">
								No GPIO configuration found, did you try to fetch the config?
								<button
									v-on="click: getConfig"
									type="submit"
									class="btn btn-info">
									Request device status
								</button>
							</p>
							<div class="col-xs-8 alert alert-info">
								This device does not have any GPIOs configured
								You can configure one in the
								<a v-link="/device/{{route.params.network}}/{{route.params.device}}/config">configuration view</a>
							</div>
						</div>

						<div v-if="gpios.length > 0" class="gpio-overview container-fluid">
							<div
								v-show="0 === gpio.config || 4 === gpio.config"
								class="gpio"
								v-repeat="gpio: gpios">
								<div class="">
									<div class="title col-xs-2">GPIO {{$index}}</div>

									<div class="value col-xs-10">
										<span
											class="type col-xs-5">Digital Output</span>
										<div
											class="digital-output col-xs-4">
											<button
												v-on="click: $set('outputs.gpio_' + $index, true)"
												class="btn btn-sm btn-success">
													On
											</button>
											<button
												v-on="click: $set('outputs.gpio_' + $index, false)"
												class="btn btn-sm btn-primary">
													Off
											</button>
											<button
												v-on="click: $set('outputs.gpio_' + $index, undefined)"
												class="btn btn-sm btn-default">
													Clear
											</button>
										</div>
										<span
											class="meta col-xs-3"
											v-class="
												on: true === outputs['gpio_' + $index],
												off: false=== outputs['gpio_' + $index]
											">
											{{outputs['gpio_' + $index] | gpioChange $index}}
										</span>
									</div>
								</div>
							</div>

							<div v-show="!supportsOutputs">
								<div class="col-xs-8 alert alert-info">
									This device does not have any GPIO's
									configured for output. You can add them through the
									<a v-link="/device/{{route.params.network}}/{{route.params.device}}/config">configuration view</a>
								</div>
							</div>
						</div>
					</div>

					<div v-show="'set_pwm' === command" class="container-fluid">
						<div v-show="supportsPWM">
							<span
								class="type bold col-xs-3">PWM Output</span>

							<div class="col-xs-7">
								<input
									id="pwmoutput"
									type="range"
									min="0"
									max="100"
									step="1"
									v-model="pwmOutput"
									number />
							</div>
							<div class="col-xs-2">
								<span>{{pwmOutput}}%</span>
							</div>
						</div>

						<div v-show="!supportsPWM">
							<div class="col-xs-8 alert alert-info">
								This device does not have a GPIO configured for PWM.
								You add one in the
								<a href="#/device/{{params.network}}/{{params.device}}/configuration">configuration view</a>
							</div>
						</div>
					</div>

					<div v-show="'set_config' === command" class="container-fluid">
						<div class="row">
							<div v-show="_.isEmpty(configPatch)" class="config-patch">
								<p class="mute">
									No changes to configuration, you can set parameters
									in the input field below.
								</p>
							</div>

							<ul v-show="!_.isEmpty(configPatch)" class="config-patch">
								<li v-repeat="val: configPatch">
									<a v-on="click: removeConfig($key, $event)">
										<code>
										<span class="key">{{$key}}</span>
										<span> := </span>
										<span class="value">{{val}}</span>
										</code>
										<span>&times;</span>
									</a>
								</li>
							</ul>

							<form class="form">
								<div class="row">
									<div class="form-group col-xs-4">
										<label for="set_config-input">Parameter</label>
										<input
											v-model="configKeyInput"
											type="text"
											class="form-control"
											id="set_config-input"
											placeholder="Config Parameter"/>

										<ul class="filtersOutput" v-show="configKeyInput && cfgInputFilterOutput && cfgInputFilterOutput[0].key !== configKeyInput">
											<li v-repeat="item: cfgInputFilterOutput">
												<a
													v-on="click: this.configKeyInput = item.key"
													v-html="item | highlight configKeyInput"></a>
											</li>
										</ul>
									</div>
									<div class="form-group col-xs-3">
										<label for="set_config-value">Value</label>
										<input
											v-model="configValInput"
											type="text"
											class="form-control"
											id="set_config-value"
											placeholder="Value ..."/>
									</div>
									<div class="col-xs-2" style="margin-top: 27px;">
										<button
											v-on="click: addConfig(configKeyInput, configValInput, $event),
											      submit: addConfig(configKeyInput, configValInput, $event)"
											type="button"
											class="btn btn-sm btn-primary">Set</button>
									</div>
								</div>
								<div v-if="configError" class="col-xs-8 alert alert-danger">
									<b>Error:</b> {{configError}}
								</div>
							</form>
						</div>
					</div>

					<div class="row">
						<div class="action pull-right">
							<label class="col-xs-8">
								<input v-model="useAck" type="checkbox">&nbsp;Request acknowledge
							</label>

							<span class="col-xs-3">
								<button
									type="submit"
									v-on="click: sendPacket"
									class="btn btn-primary">
									<span class="glyphicon glyphicon-ok"></span>&nbsp;
									Send Packet
								</button>
							</span>
						</div>
					</div>

				</div>
				<div
					class="col-md-4 col-md-offset-1"
					v-if="commands[command] && commands[command].comment">

					<p class="mute" v-html="commands[command].comment"></p>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

var config = JSON.parse(require('!raw!../config/0.4.0.json'))
var fieldDefs = JSON.parse(require('!raw!../config/0.4.0-names.json'))

var cfgparams = _.reduce(config, function(acc, group, key) {
	_.each(group, function(val) {
		val.name = fieldDefs[val.key].name;
		fieldDefs[val.key].pos = acc.length
		acc.push(val);
	})

	return acc
}, [])

var cfghints = _.map(cfgparams, function(item) {
	return {
		key: item.key,
		text: item.name + " (" + item.key + ")"
	}
})

var autocomplete = function(input, hints) {
	if (!input)
		return []

	var reg = new RegExp(input.split('').join('\\w*').replace(/\W/, ""), 'i');
	return hints.filter(function(v) {
		if (v.text.match(reg)) {
			return v;
		}
	});
}

module.exports = {
	data: function() {
		return {
			useAck: true,
			pwmOutput: 100,
			outputs: {},

			configPatch: {},
			configError: '',
			configKeyInput: '',
			configValInput: ''
		}
	},

	// allows us to fix child menu in parent
	created: function() {
		this.$parent.packets = this.commands
	},

	ready: function() {
		this.device.$promise.then(function(device) {
			this.pwmOutput = undefined !== device['proto/tm'].pwm ?  device['proto/tm'].pwm : 0
		}.bind(this))
	},

	methods: {
		addConfig: function(key, val, ev) {
			ev.preventDefault()

			this.configError = ''

			if (!fieldDefs[key]) {
				this.configError = "no such field: '" +  key + "'"
			} else if (undefined === val || '' === val) {
				this.configError = "you need to input a value"
			} else if (true === cfgparams[fieldDefs[key].pos].ro) {
				this.configError = "read-only parameter"
			} else {
				undefined === this.configPatch[key] ?  this.configPatch.$add(key, val) :  (this.configPatch[key] = val)
				this.configKeyInput = ''
				this.configValInput = ''
			}
		},

		getConfig: function(ev) {
			ev.preventDefault()

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'get_config'
					}
				},
				{
					'network': this.route.params.network,
					'device': this.route.params.device
				}
			)
		},

		removeConfig: function(key, ev) {
			ev.preventDefault()
			this.configPatch.$delete(key)
		},

		sendPacket: function(ev) {
			ev.preventDefault()

			var proto = {
				type: 'command',
				command: this.command
			}

			switch (proto.command) {
				case 'set_pwm':
					proto.pwm = 100 - this.pwmOutput
					break

				case 'set_output':
					proto.gpio = this.outputs
					break

				case 'set_config':
					var cfg = {}
					_.each(this.configPatch, function(v, k) {
						_.set(cfg, k.split(/\./), parseInt(v) || v)
					})

					proto.config = cfg
			}

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': proto
				},
				{
					'network': this.route.params.network,
					'device': this.route.params.device
				}
			)
		},
	},

	filters: {
		gpioChange: function(val, index) {
			if (undefined === val)
				return 'No Changes'

			return val ? 'Enable' : 'Disable'
		},

		highlight: {
			read: function(input, match) {
				if (!input.text)
					return ""

				return input.text.replace(new RegExp("(" + this.$get(match) + ")"), '<span class="highlight">$1</span>')
			}
		}
	},

	computed: {
		_: function() {
			return _
		},

		command: function() {
			return this.route.query.command
		},

		device: function() {
			return this.$parent.device
		},

		params: function() {
			return this.$root.$.data.params
		},

		cfgInputFilterOutput: function() {
			var res = autocomplete(this.configKeyInput, cfghints).slice(0, 10)

			if ([] == _.where(res, {key: this.configKeyInput}) && this.configKeyInput)
				res.unshift([{key: this.configKeyInput, text: this.configKeyInput}])

			return res
		},

		gpios: function() {
			if (!this.device['proto/tm'] || !this.device['proto/tm'].config)
				return []

			var config = this.device['proto/tm'].config
			if (config.gpio && undefined !== config.gpio_0.config) {
				return [
					config.gpio_0, config.gpio_1, config.gpio_2,
					config.gpio_3, config.gpio_4, config.gpio_5,
					config.gpio_6, config.gpio_7]
			} else {
				return []
			}
		},

		supportsOutputs: function() {
			return _.some(this.gpios, function(v) {
				return v.config === 0 || v.config === 4
			})
		},

		supportsPWM: function() {
			return _.some(this.gpios, function(v) {
				return v.config === 3
			})
		},

		commands: function() {
			return {
				'init_gw_config':  {
					name: 'Set GW in Config Mode',
					comment: "The <code>`command/init_gw_config`</code> sets \
					          the connected gateway into configuration mode. \
					          <b>Warning</b>: If your DCU looses connectivity \
					          with the cloud there is no way of it to \
					          re-connected without a reset."
					// constraints: [
					// 	{
					// 		type: 'EQ',
					// 		source: ["device", "type"],
					// 		match: 'gateway'
					// 	}
					// ]
				},

				'get_nid':         {
					name: 'Get NID',
					comment: "The <code>`command/get_nid`</code> queries a \
					          gateway device for it's Network ID. The response \
					          is a `event/nid` packet containing the network ID. \
					          <b>Note</b>: Only gateways respond to \
					          <code>`command/get_nid`</code> packets."
					// constraints: [
					// 	{
					// 		type: 'EQ',
					// 		source: ["device", "type"],
					// 		match: 'gateway'
					// 	}
					// ]
				},

				'get_status':      {
					name: 'Get Status',
					comment: "A <code>`command/get_status`</code> command queries a device to return it's \
					          current status. The response will be a <code>`event/ima`</code>\
					          packet containing the standard event format."

				},

				'get_did_status':  {
					name: 'Get DID Status',
					comment: "The <code>`command/get_did_status`</code> queries a device \
					          for it's next receiver. The response from the device \
					          will be a <code>`event/next_receiver`</code> packet \
					          containing the next receiver in the <code>`address`</code> \
					          field.  <em>The next receiver is the preferred route \
					          for the device to communicate through."
				},

				'get_config':      {
					name: 'Get Config',
					comment: "The <code>`command/get_config`</code> queries a \
					         device for its configuration. The device will \
					         respond with a <code>`event/config`</code> containing \
					         all the configuration parameters in the device."
				},

				'get_calibration': {
					name: 'Get Calibration',
					comment: "The <code>`command/get_calibration`</code> queries a \
					         device for the contents of it's calibration memory. The device will \
					         respond with a <code>`event/config`</code> containing \
					         all the configuration parameters in the device."
				},

				'force_reset':     {
					name: 'Force Reset',
					comment: "The <code>`command/force_reset`</code> asks the device \
					          to do a power cycle. Once the device is up a \
					          <code>`event/reset`</code> packet will be returned \
					          containing <code>`trigger := 'command'`</code>"
				},

				'get_path':        {
					name: 'Get Path',
					comment: "The <code>`command/get_path`</code> asks the device \
					          to return a list of all the communications paths \
					          in the system in the form of a <code>`event/path`</code> \
					          with all the hops and their signal strength (RSSI) \
					          in the <code>`path`</code> key."
				},

				'set_output':      {
					name: 'Set Output',
					comment: "The <code>`command/set_output`</code> allows \
					          control of the digital outputs of a device. There \
					          is no response unless <code>`device.command_ack`</code> \
					          is enabled OR the <code>`ACK`</code> bit is set in \
					          the command number."
				},

				'set_pwm':         {
					name: 'Set PWM',
					comment: "The <code>`command/set_pwm`</code> sets the the \
					          duty cycle of the <code>`PWM`</code> output of a \
					          device. There is no response unless <code>`device.command_ack`</code> \
					          is enabled OR the <code>`ACK`</code> bit is set in \
					          the command number."
					// constraints: [
					// 	{
					// 		type: 'EQ',
					// 		source: ["device", "proto/tm", "config", "gpio_7", "config"],
					// 		match: 3,
					// 		message: 'No PWM outputs configured'
					// 	}
					// ]
				},

			//	'serial':          {
			//		name: 'Serial'
			//	},

				'set_config':      {
					name: 'Set Config',
					comment: "The <code>`command/set_config`</code> sends a \
					          configuration command to the node. See \
					          <a href=\"#/help/device-configuration\">Device Configuration options</a> \
										for all possible options"
				}
			}
		}
	}
}
</script>
