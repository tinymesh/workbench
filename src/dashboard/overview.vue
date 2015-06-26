<style lang="css">
	.dashboard aside {
		padding-top: 3rem;
	}
	.dashboard .nav .active > a,
	.dashboard .nav .active > a:focus,
	.dashboard .nav .active > a:active {
		background: #337ab7;
		color: #fff;
	}
	.dashboard .nav .active > a:hover {
		background: #448bc8;
		color: #fff;
	}
</style>

<template lang="html">
	<div class="row dashboard">
		<aside class="col-xs-3">
			<ul class="nav">
				<li v-class="active: !route.query.section || 'general' === route.query.section"><a v-link="/dashboard/{{network.key}}/overview?section=general">General</a></li>
				<li v-class="active: 'acl' === route.query.section"><a v-link="/dashboard/{{network.key}}/overview?section=acl">Access Control</a></li>
<!--
				<li v-class="active: route.query.section == 'types'"><a v-link="/dashboard/{{network.key}}/overview?section=types">Types</a></li>
				<li v-class="active: route.query.section == 'metrics'"><a v-link="/dashboard/{{network.key}}/overview?section=metrics">Metrics</a></li>
				<li v-class="active: route.query.section == 'groups'"><a v-link="/dashboard/{{network.key}}/overview?section=groups">Groups</a></li>
-->
			</ul>
		</aside>
		<div v-if="network.key" class="col-xs-9">
			<div class="page-header">
				<h2>Network: {{network.name || "Unnamed network"}} &ndash; {{network.key}}</h2>
			</div>

			<div v-if="!route.query.section || 'general' === route.query.section">
				<div class="col-xs-6">
					<form role="form" class="form-horizontal">
						<div class="form-group">
							<label for="network-name" class="col-xs-4 control-label">Network Name</label>
							<div class="col-xs-8">
								<input
											type="text"
											class="form-control"
											id="network-name"
											name="network-name"
											placeholder="Network name"/>
						</div>

						<div class="form-group">
							<label class="col-xs-4 control-label">Network ID</label>
							<div class="col-xs-8">
								<p class="form-control-static">
									 <code>{{network.key}}</code> &ndash; <code><span class="mono">{{network.address | address params.address_encoding true}}</span></code>
								</p>
							</div>
						</div>
						<div class="form-group">
							<div class="col-sm-offset-4 col-sm-8 text-right"> 
								<button
									v-on="click: $parent.save(networkPatch, $event)"
									v-attr="disabled: networkPromise"
									v-class="'btn-spinner': networkPromise"
									class="btn btn-success">

									<span v-wb-spinner="networkPromise"></span>

									<span v-if="networkPromise">Saving changes</span>
									<span v-if="!networkPromise">Save changes</span>
								</button>
							</div>
						</div>
					</form>
				</div>
				<div class="col-xs-6">
					<div v-if="channels.length === 0">
						<p class="lead">
							You don't have any gateways in this network. If you want to
							connect you can always add one <a href="#/dashboard/{{network.key}}/devices">under the Devices tab!</a>
						</p>
					</div>
					<ul v-if="channels.length > 0">
						<li v-repeat="chan: channels">
							<h5>
								<b>Gateway:</b> <i>{{network.devicemap[chan.key].name || chan.key}} (uid: <span>{{network.devicemap[chan.key].address | address params.address_encoding params.address_big_endian}}</span>)</i>
								&ndash;

								<span v-if="chan.active"  class="label label-success">Connected</span>
								<span v-if="!chan.active" class="label label-danger">Disconnected</span>
							</h5>

							<div class="body">
								<span v-if="chan.meta && chan.meta.started">
									&ndash; Connected <i v-wb-fuzzy-date="chan.meta.started"></i><br />
								</span>
								<span v-if="chan.created">
									&ndash; Created <i v-wb-fuzzy-date="chan.created"></i><br />
								</span>
								<span v-if="chan.last && chan.last.end > 0">
									&ndash; Disconnected <i v-wb-fuzzy-date="chan.last.end"></i><br />
								</span>
							</div>
						</li>
					</ul>
				</div>
			</div>

			<div v-if="'acl' === route.query.section">
				<div v-component="dashboard-permissions"></div>
			</div>

			<div v-show="'types' == route.query.section">
				<div v-repeat="type: network.types">
					<h4><span class="glyphicon glyphicon-phone"></span> {{type.name || $key}}</h4>
					<div class="typedef">
						<code><pre>{{type|json}}</pre></code>
					</div>
				</div>
			</div>

			<div v-show="'metrics' == route.query.section">
				metrics
			</div>

			<div v-show="'groups' == route.query.section">
				groups
			</div>
			<!--
			<div class="col-xs-6 overview">
				<form role="form" class="form-horizontal">
					<div class="form-group">
						<label for="network-name" class="col-xs-4 control-label">Network Name</label>
						<div class="col-xs-8">
							<input
										v-model="networkPatch.name | patcher network.name"
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
								 {{network.key}} &ndash; <span class="mono">{{network.address | address params.address_encoding true}}</span>
							</p>
						</div>
					</div>
					<div class="form-group">
						<div class="col-sm-offset-4 col-sm-8 text-right"> 
							<button
								v-on="click: $parent.save(networkPatch, $event)"
								v-attr="disabled: networkPromise"
								v-class="'btn-spinner': networkPromise"
								class="btn btn-success">

								<span v-wb-spinner="networkPromise"></span>

								<span v-if="networkPromise">Saving changes</span>
								<span v-if="!networkPromise">Save changes</span>
							</button>
						</div>
					</div>
				</form>
			</div>
					-->

			<!--
			<div class="col-xs-6 channels">
				<div v-if="channels.length === 0">
					<p class="lead">
						You don't have any gateways in this network. If you want to
						connect you can always add one <a href="#/dashboard/{{network.key}}/devices">under the Devices tab!</a>
					</p>
				</div>
				<ul v-if="channels.length > 0">
					<li v-repeat="chan: channels">
						<h5>
							<b>Gateway:</b> <i>{{network.devicemap[chan.key].name || chan.key}} (uid: <span>{{network.devicemap[chan.key].address | address params.address_encoding params.address_big_endian}}</span>)</i>
							&ndash;

							<span v-if="chan.active"  class="label label-success">Connected</span>
							<span v-if="!chan.active" class="label label-danger">Disconnected</span>
						</h5>

						<div class="body">
							<span v-if="chan.meta && chan.meta.started">
								&ndash; Connected <i v-wb-fuzzy-date="chan.meta.started"></i><br />
							</span>
							<span v-if="chan.created">
								&ndash; Created <i v-wb-fuzzy-date="chan.created"></i><br />
							</span>
							<span v-if="chan.last && chan.last.end > 0">
								&ndash; Disconnected <i v-wb-fuzzy-date="chan.last.end"></i><br />
							</span>
						</div>
					</li>
				</ul>
			</div>
			-->
	 </div>
	</div>
</template>

<script type="js">
module.exports = {
	computed: {
		network: function() {
			return this.$parent.network
		},

		networkPatch: function() {
			return this.$parent.networkPatch
		},

		networkPromise: function() {
			return this.$parent.networkPromise
		},

    channels: function() {
    	return _.reduce(this.network.channels, function(acc, v, k) {
				v.key = k
       	acc.push(v)
       	return acc
      }, [])
    }

	}
}
</script>
