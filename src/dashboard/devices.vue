<style lang="css">
</style>

<template lang="html">
	<div class="row">
		<div class="col-xs-3">
			<div class="network-selector">
				<div class="page-header">
					<h6>Device Types</h6>
				</div>
				<div class="select-list" id="device-list">
					<ul>
						<li v-repeat="type: network.types">
							<div class="checkbox" v-class="active: filters.type[$key]">
								<label>
									<input
										v-on="change: typeFacet"
										v-attr="target: $key"
										type="checkbox"> {{type.name || $key}}
								</label>
							</div>
						</li>
					</ul>
				</div>
			</div>

			<div class="sorting">
				<div class="page-header">
					<h6>Order By</h6>
				</div>
				<p class="muted">
					<b>Order By:</b> <code>`{{orderBy}}`</code><br>
					<b>Reverse?:</b> <code>`{{orderReverse}}`</code>
				</p>
			</div>
		</div>

		<div class="col-xs-9">
			<div class="page-header">
				<h3>{{network.name || "Unnamed network — " + network.key}}</h3>
			</div>
			<div>
				<table class="table">
					<thead>
						<tr>
							<th><a v-on="click: setOrderBy('key');">Key</a></th>
							<th><a v-on="click: setOrderBy('address');">UID</a></th>
							<th><a v-on="click: setOrderBy('name');">Name</a></th>
							<th><a v-on="click: setOrderBy('type');">Type</a></th>
							<th><a v-on="click: setOrderBy('lastseen');">Last seen</a></th>
						<!--
											<th>In queue</th>
											<th>Status</th>
						-->
						</tr>
					</thead>
					<tbody>
						<tr v-repeat="dev: devicemap | orderBy orderBy orderReverse">
							<td><a href="#/device/{{params.network}}/{{dev.key}}">{{dev.key}}</a<</td>
							<td><span class="mono" v-wb-address="dev.address"></span></td>
							<td><a href="#/device/{{params.network}}/{{dev.key}}">{{dev.name || "unnamed"}}</a<</td>
							<td><a href="#/device/{{params.network}}/{{dev.key}}">{{dev.type}}</a<</td>
							<td><a>N/A</a></td>
		<!--
							<td><a>Empty</a<</td>
							<td>
								<span class="status text-success"><i class="glyphicon glyphicon-ok"></i> Nothing special</span>
									<span class="status text-danger"><i class="glyphicon glyphicon-paperclip"></i> Low battery</span>
									<span class="status text-danger"><i class="glyphicon glyphicon-signal"></i> Poor signal</span>
									<span class="status text-info"><i class="glyphicon glyphicon-eject"></i> Unstable link</span>
									<span class="status text-warning"><i class="glyphicon glyphicon-move"></i> Frequent resets</span>
									<span class="status text-warning"><i class="glyphicon glyphicon-_"></i> Late IMA</span>
									<span class="status text-warning"><i class="glyphicon glyphicon-_"></i> No Response</span>
								-->
		<!--
							</td>
		-->
						</tr>
						<tr v-repeat="(x=[]).length = Math.max(5 - network.meta.device.count, 0);x">
							<td><span class="dummy-block">&nbsp;</span></td>
							<td><span class="dummy-block">&nbsp;</span></td>
							<td><span class="dummy-block">&nbsp;</span></td>
							<td><span class="dummy-block">&nbsp;</span></td>
							<td><span class="dummy-block">&nbsp;</span></td>
		<!--
							<td><span class="dummy-block">&nbsp;</span></td>
							<td><span class="dummy-block">&nbsp;</span></td>
		-->
						</tr>
					</tbody>
				</table>
			</div>
			<div class="col-xs-12">
				<div class="page-header">
					<h5>Create a new device</h5>
				</div>

				<form role="form">
					<div class="row">
					<div class="form-group col-xs-4">
						<label for="device-name">Device Name</label>
						<div>
							<input
										v-model="device.name"
										type="text"
										class="form-control"
										id="device-name"
										name="device-name"
										placeholder="Device name"/>
						</div>
					</div>
					<div class="form-group col-xs-4" v-class="has-error: deviceError.address">
						<label for="device-name">Device UID</label>
						<div class=" has-feedback">
							<input
										v-model="deviceAddress"
										type="text"
										class="form-control"
										id="device-uid"
										name="device-uid"
										placeholder="0.0.0.0" />
							<span
								class="form-control-feedback inline-label label"
								v-class="label-info: !deviceError.address,label-danger: deviceError.address">{{addressType}}</span>
							<p v-if="deviceError.address" class="help-block">{{deviceError.address}}</p>
							<p class="help-block mute">
								Enter device address either as hex
								<code>`00:00:00:00`</code> or binary
								<code>`0.0.0.0`</code>.
							</p>
						</div>
					</div>
					<div class="form-group col-xs-4">
						<label for="device-name">Device Type</label>
						<div>
							<select
								v-model="device.type"
								options="networkTypes"
								id="device-type"
								name="device-type"
								class="form-control">
							</select>
						</div>
					</div>
					<div class="form-group col-xs-12">
						<button
							v-on="click: provisionDevice(device, $event)"
							v-attr="disabled: device.$promise"
							v-class="'btn-spinner': device.$promise"
							class="btn btn-success pull-right">

							<span v-wb-spinner="device.$promise"></span>

							<span v-if="device.$promise">Creating device</span>
							<span v-if="!device.$promise">Create device</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script type="js">
var
	client = require('tinymesh-cloud-client'),
	 _ = require('lodash')

module.exports = {
	data: function() {
		return {
			orderBy: 'name',
			orderReverse: false,

			addressType: false,

			device: {},
			deviceError: {},

			filters: {
				type: []
			}
		}
	},

	computed: {
		params: function() {
			return this.$root.$.data.params
		},

		network: function() {
			return this.$root.$.data.network
		},

		// orderBy needs array love to be able to sort
		devicemap: function() {
			return _.transform(this.network.devicemap, function(acc, v, k) {
				if (0 === this.filters.type.length || -1 !== _.indexOf(this.filters.type, v.type)) {
					v.key = k
					acc.push(v)
				}
			}.bind(this), [])
		},

		networkTypes: function() {
			if (!this.network)
				return [];

			return _.map(this.network.types, function(v, k) {
				return {text: v.name || k, value: k};
			});
		},

		deviceAddress: {
			get: function() {
				return this.device.address;
			},
			set: function(value) {
				// convert ip like format into long
				if (value.match(/\./)) {
					this.addressType = 'Decimal Address';
					if (!value.match(/^([0-9]{0,3}(?:\.|$)){1,4}$/)) {
						this.$set('deviceError.address', "Invalid address format");
						return;

					}
					value = parseInt(x = _.foldl(value.split(/\./).concat(["0","0","0","0"]).slice(0, 4), function(acc, e, i) {
						return ("0" + parseInt(e || "0").toString(16)).slice(-2, 4) + acc
					}, ""), 16);
				} else if (value.match(/:/) || value.match(/[a-f]/i)) {
					this.addressType = 'HEX Address';
					if (!value.match(/^([a-f0-9]{0,2}(?::|$)){1,4}$/)) {
						this.$set('deviceError.address', "Invalid hex format");
						this.device.address = undefined;
						return;
					}

					value = parseInt(_.foldl(value.split(/:/), function(acc, e, i) {
						return ("00" + (e || "")).slice(-2, 4) + acc;
					}, ""), 16);
				} else {
					this.$set('deviceError.address', undefined);
					this.addressType = 'Int Address';
					value = parseInt(value)
				}

				if (0x00ffffff === (value & 0x00ffffff)) {
					this.$set('deviceError.address', 'You cannot use group address for device');
					this.device.address = undefined;
				} else if (value > 0 && value <= 0xFFFFFFFF) {
					this.$set('deviceError.address', undefined);
					this.device.address = value;
				} else {
					this.$set('deviceError.address', 'Address must be in range 0 - ' + 0xffffffff);
					this.device.address = undefined;
				}

				return value
			}
		}
	},

	methods: {
		setOrderBy: function(orderBy) {
			if (orderBy.match(/\//))
				orderBy = _.map(orderBy.split(/\./), function(val) {
					return val.match(/\//) ? '[\'' + val + '\']' : val
				}).join('.')

			if (orderBy === this.orderBy)
				this.orderReverse = !this.orderReverse

			this.orderBy = orderBy
		},

		provisionDevice: function(device, e) {
			e.preventDefault();

			this.device = client.device.create(
				{auth: this.$root.$.auth.data},
				device,
				{network: this.params.network});

			this.device.$promise.then(function(device) {
				this.$parent.$.notify.add('Device was successfully created', 'success')
				this.device.$promise = undefined

				// Error on initial networks where devicemap is an array
				// quick fix is to reload the page
				if (_.isArray(this.network.devicemap)) {
					window.location.reload();
				} else {
					this.network.$get({auth: this.$root.$.auth.data});

					this.network.devicemap.$add(device.key, {
						key: device.key,
						name: device.name,
						address: device.address,
						type: device.type
					});
					this.network.devices.$add(device.address, device.key);
				}
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$parent.$.notify.set('Failed to provision device: ' + msg, 'danger')
				this.device.$promise = undefined
			}.bind(this));
		},

		typeFacet: function(ev) {
			if (ev.target.checked)
				this.$set('filters.type',
					_.union(this.filters.type,
						[ev.target.attributes.target.value]))
			else
				this.$set('filters.type',
					_.without(this.filters.type,
						ev.target.attributes.target.value))
		}
	}
}
</script>
