<template>
			<div class="row">
				<form name="device" role="form" class="form form-horizontal container-fluid">
					<div class="col-xs-6">
						<div class="form-group">
								<label class="col-xs-4 control-label">Device Name</label>
								<div class="col-xs-8">
									<input
												v-model="devicePatch | patcher 'name' devicePatch device"
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
										v-model="devicePatch | patcher 'type' devicePatch device"
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
									<span>{{device.address | address params.address_encoding params.address_big_endian}}</span>
								</p>
							</div>
						</div>

						<div>
								<label class="col-xs-4 control-label">Part Number</label>
								<div class="col-xs-8">
								<p class="form-control-static">
									{{(((device['proto/tm'] || {}).config || {}).device || {}).part || "not available"}}
								</p>
								</div>
						</div>

						<div>
								<label class="col-xs-4 control-label">HW Revision</label>
								<div class="col-xs-8">
									<p class="form-control-static">
										{{(device['proto/tm'] || {}).hw || (((device['proto/tm'] || {}).config || {}).device || {}).hw_revision || "not available"}}
									</p>
								</div>
						</div>

						<div>
							<label class="col-xs-4 control-label">FW Revision</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									{{(device['proto/tm'] || {}).fw || (((device['proto/tm'] || {}).config || {}).device || {}).fw_revision || "not available"}}
								</p>
							</div>
						</div>

						<div>
							<label class="col-xs-4 control-label">Last Message</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									<span v-if="msgs.length > 0">
										<span v-wb-fuzzy-date="msgs[msgs.length - 1].datetime"></span>
									</span>
									<span v-if="msgs.length === 0 && device.meta.msg.last && device.meta.msg.last.date">
										<span v-wb-fuzzy-date="device.meta.msg.last.date">Unknown</span>
									</span>
									<span
										v-if="msgs.length === 0 && (!device.meta.msg.last || !device.meta.msg.last.date)">Unknown</span>
								</p>
							</div>
						</div>
					</div>

					<div>
						<div class="col-sm-offset-2 col-sm-4">
							<button
								v-on="click: $parent.save(devicePatch, $event)"
								v-class="'btn-spinner': $parent.devicePromise"
								class="btn btn-success pull-right">

								<span>Save changes</span>
							</button>
						</div>
					</div>
				</form>
			</div>
</template>
<script>
module.exports = {
	computed: {
		device: function() {
			return this.$parent.device
		},

		devicePatch: function() {
			return this.$parent.devicePatch
		},

		msgs: function() {
			return this.$parent.msgs
		},

		availableDeviceTypes: function() {
			if (!this.$root.$.data.networks) {
				alert('network list unavailable, please refresh the page')
				return [];
			}

			var network = _.findWhere(this.$root.$.data.networks, {key: this.route.params.network})

			if (!network) {
				alert('failed to find network, please refresh the page')
				return []
			}

			return _.map(network.types, function(v, k) {
				return {text: v.name || k, value: k};
			});
		},
	}
}
