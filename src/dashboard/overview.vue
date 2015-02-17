<style lang="css">
</style>

<template lang="html">
	<div class="row">
		<div class="page-header">
			<h3>{{network.name || "Unnamed network — " + network.key}}</h3>
		</div>
		<div class="col-xs-6 overview">
			<form role="form" class="form-horizontal">
				<div class="form-group">
					<label for="network-name" class="col-xs-4 control-label">Network Name</label>
					<div class="col-xs-8">
						<input
									v-model="network.name"
									type="text"
									class="form-control"
									id="network-name"
									name="network-name"
									placeholder="Network name"/>
					</div>
				</div>
				<div class="form-group">
					<label class="col-xs-4 control-label">Network ID</label>
					<div class="col-xs-8">
						<p class="form-control-static">
							 {{network.key}} &ndash; <span class="mono" v-wb-address="network.address" wb-address-endian="big"></span>
						</p>
					</div>
				</div>
				<div class="form-group">
					<div class="col-sm-offset-4 col-sm-8 text-right"> 
						<button
							v-on="click: save(network, $event)"
							v-attr="disabled: updatePromise"
							v-class="'btn-spinner': updatePromise"
							class="btn btn-success">

							<span v-wb-spinner="updatePromise"></span>

							<span v-if="updatePromise">Saving changes</span>
							<span v-if="!updatePromise">Save changes</span>
						</button>
					</div>
				</div>
			</form>
		</div>

		<div class="col-xs-6 channels">
			<ul>
				<li v-repeat="network.channels">
					<h5>
						<b>Gateway:</b> <i>{{network.devicemap[$key].name || $key}} (uid: <span v-wb-address="network.devicemap[$key].address"></span>)</i>
						&ndash;
						<span v-if="active"  class="label label-success">Connected</span>
						<span v-if="!active" class="label label-danger">Disconnected</span>
					</h5>

					<div class="body">
						<span v-if="meta.started">&ndash; Connected <i v-wb-fuzzy-date="meta.started"></i><br /></span>
					<!--
						<span>Queue length: <i>{{meta.queue_size}}</i></span><br />
						<span>% of network traffic:
								<i class="rx">{{((meta.tcp.rx||0)/(network.meta.net.tcp.rx||1))*100}}% (rx)</i> /
								<i class="tx">{{((meta.tcp.tx||0)/(network.meta.net.tcp.tx||1))*100}}% (tx)</i>
						</span>
					-->
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>

<script type="js">
module.exports = {
	computed: {
		params: function() {
			return this.$root.$.data.params
		},

		network: function() {
			return this.$root.$.data.network
		}
	}
}
</script>
