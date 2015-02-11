require('!style!css!./style.css');

var
	client = require('tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	Finch = (require('../vendor/finch')).Finch,
	store = require('store');

require('../network/setup-guide');


var route = function(args) {
	app.$set('view', 'dashboard');
	app.$.data.$set('params.network', args.nid);
	app.$.data.$set('params.tab', args.tab);

	app.$.data.networks.$promise
		.then(function(networks) {
			// Resume setup guide if not completed
			if (!args.nid && app.$.data.initialSetup) {
				if (networks[0]) {
					app.$.data.$set('params.network', networks[0].key);
					Finch.navigate('/dashboard/' + networks[0].key);
				}
			} else if (args.nid) {
				//	404 not found...
				//undefined === _.find(networks, {key: this.params.network})
				var network = _.find(networks, {key: this.params.network});
				app.$.data.$set('network',
					network || {error: "Network was not found", code: 404});
				app.$emit('data:network', network);
			}
		});
};

Finch.route('/dashboard', route);
Finch.route('/dashboard/:nid', route);
Finch.route('/dashboard/:nid/:tab', route);

Vue.component('dashboard', {
	template: require('!raw!./template.html'),
	data: function() {
		return {
			updatePromise: undefined,
			devicePromise: undefined,
			newdevice: {
				name: "",
				address: undefined,
				type: "device"
			},
			deviceError: {},
			viewOpts: {
				field: 'address',
				reverse: false,
				addressType: '',
			}
		}
	},
	methods: {
		setDeviceOrderBy: function(field) {
			if (this.viewOpts.field === field)
				this.viewOpts.reverse = !this.viewOpts.reverse;

			this.viewOpts.field = field;
			console.log(this.viewOpts.field, this.viewOpts.reverse);
		},
		toggleSetupGuide: function() {
			var old = store.get('skipSetupGuide.' + this.params.network);
			store.set('skipSetupGuide.' + this.params.network, !old);
		},
		save: function(network, e) {
			e.preventDefault();
			this.updatePromise = network.$update({auth: this.$root.$.auth.data}).$promise;
			this.updatePromise.then(function() {
				this.updatePromise = undefined
				this.$root.$.notify.set('Device was successfully created', 'success')
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$root.$.notify.set('Failed to update network: ' + msg, 'danger')
				this.updatePromise = undefined
			}.bind(this));
		},
		provision: function(device, e) {
			e.preventDefault();

			this.devicePromise = client.device.create(
				{auth: this.$root.$.auth.data},
				device,
				{network: this.params.network}).$promise;

			this.devicePromise.then(function(device) {
				this.$root.$.notify.add('Device was successfully created', 'success')
				this.devicePromise = undefined

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
				this.$root.$.notify.set('Failed to provision device: ' + msg, 'danger')
				this.devicePromise = undefined
			}.bind(this));
		},
	},
	computed: {
		skipSetupGuide: function() {
			return true === store.get('skipSetupGuide.' + this.params.network);
		},
		params: function() {
			return this.$root.$.data.params;
		},
		network: function() {
			return this.$root.$.data.network;
		},
		networks: function() {
			return this.$root.$.data.networks;
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
				return this.newdevice.address;
			},
			set: function(value) {
				// convert ip like format into long
				if (value.match(/\./)) {
					this.viewOpts.addressType = 'Decimal Address';
					if (!value.match(/^([0-9]{0,3}(?:\.|$)){1,4}$/)) {
						this.$set('deviceError.address', "Invalid address format");
						return;

					}
					value = parseInt(x = _.foldl(value.split(/\./).concat(["0","0","0","0"]).slice(0, 4), function(acc, e, i) {
						return ("0" + parseInt(e || "0").toString(16)).slice(-2, 4) + acc
					}, ""), 16);
				} else if (value.match(/:/) || value.match(/[a-f]/i)) {
					this.viewOpts.addressType = 'HEX Address';
					if (!value.match(/^([a-f0-9]{0,2}(?::|$)){1,4}$/)) {
						this.$set('deviceError.address', "Invalid hex format");
						this.newdevice.address = undefined;
						return;
					}

					value = parseInt(_.foldl(value.split(/:/), function(acc, e, i) {
						return ("00" + (e || "")).slice(-2, 4) + acc;
					}, ""), 16);
				} else {
					this.$set('deviceError.address', undefined);
					this.viewOpts.addressType = 'Int Address';
				}

				if (0x00ffffff === (value & 0x00ffffff)) {
					this.$set('deviceError.address', 'You cannot use group address for device');
					this.newdevice.address = undefined;
				} else if (value > 0 && value <= 0xFFFFFFFF) {
					this.$set('deviceError.address', undefined);
					this.newdevice.address = value;
				} else {
					this.$set('deviceError.address', 'Address must be in range 0 - ' + 0xffffffff);
					this.newdevice.address = undefined;
				}
			}
		}
	}
});

// add export to route after auth, bit messy but fuck yeah!
module.exports = function() {
	return Finch.route('/', route);
};
