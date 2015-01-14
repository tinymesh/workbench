require('insert-css')(require('./style.css'));

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
    Vue = require('vue'),
    _ = require('lodash');

Vue.component('wb-network-setup-guide', {
	template: require('./template.html'),
	replace: true,
	inherit: true,
	data: function() {
		return {
			newnetwork: "",
			channelname: "",
			channeluid: "1",
			errors: {},
			channelPromise: undefined,
			networkPromise: undefined,
		}
	},
	methods: {
		createNetwork: function(name, e) {
			e.preventDefault();

			if (!name)
				this.$set('errors.newnetworkname', "You need to name your network");
			else
				delete this.errors.newnetworkname;

			if (Object.keys(this.errors).length > 0)
				return;

			this.$root.$.data.network = client.network.create(
				{auth: this.$root.$.auth.data},
				{name: name}
			);

			this.networkPromise = this.$root.$.data.network.$promise;
			this.networkPromise.then(function(network) {
					this.$set('networkPromise', undefined);
					this.$root.$.data.networks.push(network);
					this.$root.$.data.$set('network', network);
					Finch.navigate('/dashboard/' + network.key);
				}.bind(this),
				function(err) {
					this.networkPromise = undefined;
					this.$root.$.notify.set('Failed to create network: ' + err.error.message, 'danger');
				}.bind(this));
		},
		createChannel: function(e) {
			e.preventDefault();

			if (!this.channelname)
				this.$set('errors.channelname', "Please name your channel");
			else
				delete this.errors.channelname;

			if (!this.address)
				this.$set('errors.uid', "Specify the device UID");
			else if (this.address <= 0 || this.address > 0xFFFFFFFF)
				this.$set('errors.uid', "Address must be in range 1..4294967295");
			else
				delete this.errors.uid;

			if (Object.keys(this.errors).length > 0)
				return;

			var payload = {
				name: this.channelname,
				address: this.address,
				type: 'gateway'
			};

			this.channelPromise = client.device.create(
				{ auth: this.$root.$.auth.data },
				payload,
				{ network: this.network.key }
			).$promise;

			this.channelPromise.then(function(resp) {
				this.channelPromise = undefined;
				this.network.$get({auth: this.$root.$.auth.data})
					.$promise.then(function(vals) {
						this.$root.$.data.$set('network', vals);
						this.$root.$.data.$set('network.channels', vals.channels);
					}.bind(this));
			}.bind(this), function(err) {
				this.channelPromise = undefined;
				if (409 === err.status) {
					this.$set('errors.uid', "It seems like something already occupies this address");
					this.network.$get({auth: this.$root.$.auth.data});
				} else {
					this.$root.$.notify.set('Ops, an error occured: ' + err.error, 'danger');
				}
			}.bind(this));
		}
	},
	computed: {
		network: function() {
			return this.$root.$.data.network;
		},
		address: function() {
			if (this.channeluid.match(/^(?:[0-9a-f]{1,2}:){0,3}[0-9a-f]{1,2}$/i)) {
				return parseInt(_.map(this.channeluid.split(':'), function(m) {
					return ("0" + m).slice(-2, 4);
				}).reverse().join(""), 16)
			} else if(this.channeluid.match(/^(?:[0-9]{0,3}\.){0,3}[0-9]{0,3}$/)) {
				return parseInt(_.map(this.channeluid.split('.'), function(m) {
					return parseInt(m).toString(16);
				}).reverse().join(''), 16);
			} else if(this.channeluid.match(/^[0-9]*$/)) {
				return parseInt(this.channeluid);
			} else {
				return -1;
			}
		},
		chanuidbytes: function() {
			if (!this.network)
				return [];

			var key = Object.keys(this.network.channels)[0];
			return _.filter(("00000000" + this.network.devicemap[key].address.toString(16))
				.slice(-8, 16)
				.split(/(..)/));
		},
		nidbytes: function() {
			if (!this.network)
				return [];

			return _.filter(("00000000" + parseInt(this.network.key, 36).toString(16))
				.slice(-8, 16)
				.split(/(..)/));
		}
	}
});
