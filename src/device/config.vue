<template lang="html">
	<form name="config" class="config" role="form" v-if="config">

		<div class="alert alert-warning" v-if="!deviceConfig.device.part_number">
			<h4>No configuration found!!</h4>
			<p>
				The firmware revision and part number could not be found.
				This is most likely that the device have never transmitted its
				configuration, <b>configuration changes are dangerous since
				certain fields are dependant on firmware vision or part number.</b>
			</p>
			<p>
				Try sending a <code>`command/get_config`</code> packet to resolve the issue. 
			</p>
		</div>

		<div class="row group" v-repeat="group: config" v-show="group.itemsLength > 0">
			<div class="container">
				<div class="page-header">
					<h4>{{group.name || $key}}</h4>
				</div>


				<div class="params">
					<div v-repeat="field: group.items" class="col-xs-4">

						<div v-if="field.enum">
							<label for="input-{{group.key}}-{{field.subkey}}" class="control-label">{{field.name || $key}}</label>
							<select
								v-model="patchConfig"
								options="field.enum"
								class="form-control"></select>
						</div>

						<div v-if="!field.enum">
							<label for="input-{{group.key}}-{{field.subkey}}" class="control-label">{{field.name || $key}}</label>
							<input
								v-model="patchConfig"
								value="{{field.value}}"
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

		<div class="form-group">
			<div class="col-sm-offset-8 col-sm-4"> 
				<button
					v-on="click: save(configpatch, $event)"
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
var config = JSON.parse(require('!raw!./config/0.4.0.json'))
var fieldDefs = JSON.parse(require('!raw!./config/0.4.0-names.json'))

module.exports = {
	data: function() {
		return {
			configpatch: {
				'device': {},
			}
		}
	},
	methods: {
		save: function(cfg, e) {
			var patch = {
				'proto/tm': {
					config: cfg
				}
			}

			this.$parent.save.call(this, patch, e);
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

		patchConfig: {
			get: function(val) {
				return this.deviceConfig[this.field.group][this.field.subkey];
			},
			set: function(val) {
				console.log('patch', 'configpatch.' + this.field.key, val)
				this.$set('configpatch.' + this.field.key, val)
				return val
			}
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
						items: {}
					}
				}

				if (!this.device['proto/tm'].config[k]) {
					// avoid undefined error by creating necessary groups
					this.device['proto/tm'].config[k] = this.device['proto/tm'].config[k] || {}
						this.$parent.$set(
						'device[\'proto/tm\'].config.' + k,
						{})
						this.configpatch[k] = {}
				}

				acc[group].itemsLength = 0;

				_.each(v, function(field, i) {
					if (field.before && field.before < vsn)
						return

					if (field.since && field.since > vsn)
						return

					field.group = k;

					acc[group].items[i] = _.merge(field, fieldDefs[field.key])
					acc[group].items[i].subkey = i
					acc[group].itemsLength++;
					//this.device['proto/tm'].config[k][i] = this.device['proto/tm'].config[k][i] || undefined;
					if (!this.field) {
						this.$set('field', field);
						this.$set('group', acc[group])
					}
				}.bind(this))
				return acc
			}.bind(this), {})

			return groups
		}
	}
}
</script>

