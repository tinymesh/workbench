<template lang="html">
	<form name="config" class="config" role="form">
		<div class="page-header">
			<h3>{{device.name || "Unnamed device - " + device.key}}</h3>
		</div>

		<p class="lead" v-if="!deviceConfig">
			The configuration for this device is not loaded, <a v-on="click: getConfig">fetch the configuration?</a>
		</p>

		<div v-if="deviceConfig">
			<div
					class="row group"
					v-repeat="group: configmap">
				<div class="container-fluid">
					<div class="page-header">
						<h4>{{group.name || $key}}</h4>
					</div>


					<div class="params row" v-repeat="sub: group.subgroups" groups>
						<div class="container-fluid">
							<div v-repeat="field: sub" class="col-xs-4">
								<div v-if="field.enum">
									<label for="input-{{field.group}}-{{field.subkey}}" class="control-label">{{field.name || $key}}</label>
									<select
										v-model="newcfg | configPatch newcfg field deviceConfig"
										options="field.enum"
										class="form-control" number></select>
								</div>

								<div v-if="!field.enum">
									<label for="input-{{field.group}}-{{field.subkey}}" class="control-label">{{field.name || $key}}</label>
									<input
										v-model="newcfg | configPatch newcfg field deviceConfig"
										type="text"
										id="input-{{group.key}}-{{field.subkey}}"
										class="form-control"
										v-attr="disabled: field.ro ? 'yes' : false"
										number />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
	 	</div>

		<div class="form-group">
			<div class="col-sm-offset-8 col-sm-4">
				<button
					v-on="click: getConfig"
					class="btn btn-primary">

					<span >Fetch Configuration</span>
				</button>

				<button
					v-show="deviceConfig"
					v-on="click: setConfig(newcfg, $event)"
					class="btn btn-success">


					<span>Update config</span>
				</button>
			</div>
		</div>
	</form>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	Promise = require('../es6-promise.js').Promise

var config = JSON.parse(require('!raw!./config/0.4.0.json'))
var fieldDefs = JSON.parse(require('!raw!./config/0.4.0-names.json'))
var configmap = (function() {
	 // regroup some things, filter some other things
	 var mapToGroup = {
		 'gpio_0': 'gpio',
		 'gpio_1': 'gpio',
		 'gpio_2': 'gpio',
		 'gpio_3': 'gpio',
		 'gpio_4': 'gpio',
		 'gpio_5': 'gpio',
		 'gpio_6': 'gpio',
		 'gpio_7': 'gpio',
		 'pulse_counter': 'gpio',
	 }

	 var nameMap = {
		 uart: 'UART Configuration',
		 security: 'Security Configuration',
		 rf_jamming: 'RF Jamming Functions',
		 rf: 'RF Settings',
		 net: 'Network Configuration',
		 ima: 'Status Reporting',
		 gpio: 'GPIO Functions',
		 end_device: 'End Device Configuration',
		 device: 'Device Configuration',
		 cluster: 'Cluster Configuration',
	 }

	 var groups = _.reduce(config, function(acc, v, k) {
		 var group = mapToGroup[k] || k

		 if (!acc[group]) {
			 acc[group] = {
				 key: group,
				 name: nameMap[group],
				 subgroups: {}
			 }
		 }

		 acc[group].itemsLength = 0;

		 _.each(v, function(field, i) {
			 field.group = k
			 field.subkey = i

			 if (field['enum'])
				 field['enum'] = _.map(field['enum'], function(v) {
					 return v.toString()
				 })

			 acc[group].itemsLength++;
			 if (!acc[group].subgroups[k])
				 acc[group].subgroups[k] = {}
			 acc[group].subgroups[k][i] = _.merge(field, fieldDefs[field.key])

		 }.bind(this))
		 return acc
	 }.bind(this), {})

	 return groups
 })()

module.exports = {
	data: function() {
		return {
			newcfg: {},
			stream: undefined,
			msg: undefined,
			updatePromise: undefined
		}
	},

	events: {
		'stream:open': function(stream) {
			this.stream = stream
			this.$parent.$.notify.clear()
		},
		'stream:close': function(stream) {
			this.stream = undefined
		}
	},

	methods: {
		setConfig: function(newcfg, ev) {
			ev.preventDefault()

			if (!this.stream) {
				this.$parent.$.notify.set('Sync is not ready yet, please wait for bit.', 'danger')
				return
			}

			var ctx = this

			promise = new Promise(function(resolve, reject) {
				setTimeout(function() {
					reject.call(ctx, "timeout")
				}, 20000)
				client.message.create(
					{ auth: ctx.$root.$.auth.data, },
					{
						'proto/tm': {
							'type': 'command',
							'command': 'set_config',
							'config': newcfg
						}
					},
					{
						'network': ctx.route.params.network,
						'device': ctx.route.params.device
					}
				).$promise
					.then(function(err) {
						ctx.$parent.$.notify.set('Configuration sent')
					})
					.catch(function(err) {
						ctx.$parent.$.notify.set('error sending msg: ' + err)
						return err
					})

					ctx.$on('data:msg:device', function(msg) {
						if (msg['proto/tm'].detail === 'reset')
							resolve.call(ctx, msg)
					})
			}).catch(function(err) {
				if ('timeout' === err) {
					this.$parent.$.notify.set('Setting configuration timed out, are you sure the mesh is online?', 'warning')
				} else {
					this.$parent.$.notify.set('Error: ' + err, 'danger')
				}

				return err
			}.bind(this))

			this.$root.$.loader.await(promise)
		},

		getConfig: function(ev) {
			ev.preventDefault()

			if (!this.stream) {
				this.$parent.$.notify.set('Sync is not ready yet, please wait for bit.', 'danger')
				return
			}


			var
				ctx = this,
				stream,
				promise

			promise = new Promise(function(resolve, reject) {
				setTimeout(function() {
					reject.call(ctx, "timeout")
				}, 10000)

				client.message.create(
						{ auth: ctx.$root.$.auth.data, },
						{
							'proto/tm': {
								'type': 'command',
								'command': 'get_config'
							}
						},
						{
							'network': ctx.route.params.network,
							'device': ctx.route.params.device
						}
					).$promise.catch(function(err) {
						ctx.$parent.$.notify.set('error sending msg: ' + err)
						reject.call(ctx, err)
					})

				ctx.$on('data:msg:device', function(msg) {
					if (msg['proto/tm'].detail === 'config')
						resolve.call(ctx, msg)
				})
			}).catch(function(err) {
				if ('timeout' === err) {
					this.$parent.$.notify.set('Fetching configuration timed out, are you sure the mesh is online?', 'warning')
				} else {
					this.$parent.$.notify.set('Error: ' + err, 'danger')
				}
				return err
			}.bind(this))

			promise.then(function(msg) {
				ctx.msg = msg
			})

			this.$root.$.loader.await(promise)
		}
	},

	filters: {
		configPatch: {
			write: function(value, prevVal, target, field, source) {
				if (undefined === target[field.group])
					target.$add(field.group, {})

				if (undefined === target[field.group][field.subkey])
					target[field.group].$add(field.subkey, value)
				else
					target[field.group].$set(field.subkey, value)

				return target
			},

			read: function(value, target, field, source) {
				// old firmware, feature not supported
				if (!source[field.group] || undefined === source[field.group][field.subkey])
					return

				return (value[field.group] || {})[field.subkey] || source[field.group][field.subkey]
			}
		}
	},

	computed: {
		params: function() {
			return this.$root.$.data.params;
		},

		device: function() {
			return this.$parent.device;
		},

		deviceConfig: function() {
			return ((this.msg || {})['proto/tm'] || {}).config || undefined
		},


		configmap: function() { return configmap; }
	}
}
</script>
