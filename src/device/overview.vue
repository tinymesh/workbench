<style lang="css">
	.dropdown-control:hover > .dropdown-menu, .dropdown-menu:hover {
		display: block;
	}

	.dropdown-control:focus > .dropdown-menu,
	.dropdown-control:active > .dropdown-menu {
		display: block;
	}
	.dropdown-control > .dropdown-menu { margin-top: -1px; }

	.device-overview aside {
		padding-top: 3rem;
	}
	.device-overview .nav .active > a,
	.device-overview .nav .active > a:focus,
	.device-overview .nav .active > a:active {
		background: #337ab7;
		color: #fff;
	}
	.device-overview .nav .active > a:hover {
		background: #448bc8;
		color: #fff;
	}

	.device-overview .nav .nav a {
		padding: 6px 35px 5px;
	}
	.device-overview .nav .nav {
		padding-top: 5px;
		background: #fafafa;
	}

	.device-overview .nav .nav .active > a,
	.device-overview .nav .nav .active > a:focus,
	.device-overview .nav .nav .active > a:active {
		background: #e3e3e3;
		color: #555;
		font-weight: bold;
	}
	.device-overview .nav .nav .active > a:hover {
		background: #dadada;
	}

</style>
<template lang="html">
	<div class="device-overview">
		<aside class="col-xs-3">
			<ul class="nav">
				<li v-class="active: !route.query.section || 'general' == route.query.section"><a v-link="/device/{{route.params.network}}/{{route.params.device}}/overview?section=general">General</a></li>
				<li v-class="active: 'serial' == route.query.section"><a v-link="/device/{{route.params.network}}/{{route.params.device}}/overview?section=serial">UART Communication</a></li>
				<li v-class="active: 'gpio' == route.query.section"><a v-link="/device/{{route.params.network}}/{{route.params.device}}/overview?section=gpio">GPIO state</a></li>
				<li v-class="active: 'packets' == route.query.section">
					<a v-link="/device/{{route.params.network}}/{{route.params.device}}/overview?section=packets">Send Command</a>

					<ul class="nav" v-if="active: 'packets' == route.query.section">
						<li v-repeat="cmd: packets" v-class="active: $key === route.query.command">
							<a v-link="/device/{{route.params.network}}/{{route.params.device}}/overview?section=packets&command={{$key}}">{{cmd.name}}</a>
						</li>
					</ul>
				</li>
			</ul>
		</aside>
		<div class="col-xs-9" v-if="!device.key">
				<p class="lead text-center">
					Loading...
				</p>
		</div>
		<div class="col-xs-9" v-if="device.key">
			<div class="page-header">
				<h3>{{device.name || "Unnamed device"}}</h3>
			</div>

			<div v-if="!route.query.section || 'general' === route.query.section" v-component="device-overview-landing"></div>
			<div v-if="'serial' === route.query.section" v-component="device-overview-serial"></div>
			<div v-if="'gpio' === route.query.section" v-component="device-overview-gpio"></div>
			<div v-if="'packets' === route.query.section" v-ref="packets" v-component="device-overview-packets"></div>

	 </div>
	</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

module.exports = {
	data: function() {
		return {
			msgs: [],

			packets: []
		}
	},

	components: {
		'device-overview-landing': require('./overview/landing.vue'),
		'device-overview-gpio': require('./overview/gpio.vue'),
		'device-overview-serial': require('./overview/serial.vue'),
		'device-overview-packets': require('./overview/packets.vue')
	},

	methods: {
		save: function(device, e) {
			this.$parent.save.call(this, device, e);
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
		}
	}
};
</script>
