<template lang="html">
	<form name="config" class="config" role="form" v-if="config">
		<div class="page-header">
			<h3>{{device.name || "Unnamed device"}}</h3>
		</div>

		<div class="alert alert-warning" v-if="!deviceConfig.device.part">
			<h4>Configuration Disabled</h4>
			<p>
				The firmware revision and part number could not be found.
				It's most likely that the device never transmitted its
				configuration, <b>configuration changes are dangerous since
				certain fields are dependant on firmware vision or part number.</b>
			</p>
			<p>
				Try sending a <code>`command/get_config`</code> packet to resolve the issue. 
			</p>
		</div>

		<div class="alert alert-warning" v-if="deviceConfig._staged">
			<h4>Configuration in process</h4>
			<p>
				Device configuration has diverged, the following updates are pending:

				<ul>
					<li v-repeat="stage: stagedFlattend">
						<b>Message:</b> <a>{{$key}}</a>
						<ul>
							<li v-repeat="item: stage">
								Update <b>{{item.key}}</b>
									from <code>{{item.prevVal}}</code> to <code>{{item.value}}</code>
							</li>
						</ul>
					</li>
				</ul>
			</p>
			<p>
				If this message persists try sending a <code>`command/get_config`</code>
				packet to update the configuration.
			</p>
		</div>

		<div v-show="deviceConfig.device.part">
			<div
					class="row group"
					v-repeat="group: config"
					v-show="group.itemsLength > 0">
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
										v-model="devicePatch | configPatch deviceConfig"
										options="field.enum"
										class="form-control" number></select>
								</div>

								<div v-if="!field.enum">
									<label for="input-{{field.group}}-{{field.subkey}}" class="control-label">{{field.name || $key}}</label>
									<input
										v-model="configPatch[field.group][field.subkey] | configPatch deviceConfig"
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
					v-class="'btn-spinner': $parent.devicePromise"
					class="btn btn-primary">

					<span v-wb-spinner="$parent.devicePromise"></span>

					<span v-if="$parent.devicePromise">Fetching Configuration</span>
					<span v-if="!$parent.devicePromise">Fetch Configuration</span>
				</button>
				<button
					v-show="deviceConfig.device.part"
					v-on="click: save(devicePatch, $event)"
					v-attr="disabled: $parent.devicePromise"
					v-class="'btn-spinner': $parent.devicePromise"
					class="btn btn-success">

					<span v-wb-spinner="$parent.devicePromise"></span>

					<span v-if="$parent.devicePromise">Saving configuration</span>
					<span v-if="!$parent.devicePromise">Save config</span>
				</button>
			</div>
		</div>
	</form>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

var config = JSON.parse(require('!raw!./config/0.4.0.json'))
var fieldDefs = JSON.parse(require('!raw!./config/0.4.0-names.json'))

module.exports = {
	data: function() {
		return {
			hasConfig: false
		}
	},

	methods: {
		save: function(patch, ev) {
			this.$parent.save.call(this, patch, ev);
		},

		getConfig: function(ev) {
			ev.preventDefault()

			var p = client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'get_config'
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)

			this.$root.$.loader.await(p.$promise)
		}
	},

	created: function() {
		_.each(config, function(v, k) {
			if (!this.devicePatch['proto/tm'])
				this.$parent.$set('devicePatch[\'proto/tm\']', {})

			if (!this.devicePatch['proto/tm'].config)
				this.$parent.$set('devicePatch[\'proto/tm\'].config', {})

			if (!this.devicePatch['proto/tm'].config[k])
				this.$parent.$set('devicePatch[\'proto/tm\'].config.' + k, {})
		}.bind(this))
	},

	filters: {
		configPatch: {
			write: function(value, prevVal, source) {
				this.$set('devicePatch[\'proto/tm\'].config.' + this.field.group + '.' + this.field.subkey, value)
				return value
			},

			read: function(value, source ) {
				return value ? value : ((this.$get(source) || {})[this.field.group] || {})[this.field.subkey] || undefined
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
			return this.$parent.device['proto/tm'].config;
		},

		devicePatch: function() {
			return this.$parent.devicePatch
		},

		stagedFlattend: function() {
			var
				ret = {},
				cfg = this.deviceConfig

			_.each(this.deviceConfig._staged, function(items, k) {
				ret[k] = _.reduce(items, function(acc, v, k) {
					 return acc.concat(_.map(v, function(item, k2) {
						 return {
							key: [k, k2].join('.'),
							value: item,
							prevVal: cfg[k][k2]
						}
					}))
				}, [])
			})

			return ret
		},

		config: function() {
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

			this.device['proto/tm'] = this.device['proto/tm'] || {}
			this.device['proto/tm'].config = this.device['proto/tm'].config || {}
			this.device['proto/tm'].config.device = this.device['proto/tm'].config.device || {}
			var vsn = this.device['proto/tm'].config.device.fw_revision || "1.00"

			var groups = _.reduce(config, function(acc, v, k) {
				var group = mapToGroup[k] || k

				if (!acc[group]) {
					acc[group] = {
						key: group,
						name: nameMap[group],
						subgroups: {}
					}
				}

				if (!this.device['proto/tm'].config[k]) {
					// avoid undefined error by creating necessary groups
					this.device['proto/tm'].config[k] = this.device['proto/tm'].config[k] || {}
						this.$parent.$set(
						'device[\'proto/tm\'].config.' + k,
						{})
				}

				acc[group].itemsLength = 0;

				_.each(v, function(field, i) {
					if (field.before && field.before < vsn)
						return

					if (field.since && field.since > vsn)
						return

					field.group = k
					field.subkey = i

					if (field['enum'])
						field['enum'] = _.map(field['enum'], function(v) {
							return v.toString()
						})

					field = _.merge(field, fieldDefs[field.key])
					acc[group].itemsLength++;
					acc[group].subgroups[k] = acc[group].subgroups[k] || {}
					acc[group].subgroups[k][i] = field

				}.bind(this))
				return acc
			}.bind(this), {})

			return groups
		}
	}
}
</script>
