require('insert-css')(require('./style.css'));

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
    _ = require('lodash');

module.exports = {
	template: require('./template.html'),
	replace: true,
	inherit: true,
	data: function() {
		return {
			newnetwork: "",
			channelname: "",
			channeluid: "1",
			network: undefined,
			errors: {},
		}
	},
	methods: {
		createNetwork: function(name, e) {
			console.log('mjau');
			e.preventDefault();

			if (!name)
				this.$set('errors.newnetworkname', "You need to name your network");
			else
				delete this.errors.newnetworkname;

			if (Object.keys(this.errors).length > 0)
				return;


			console.log('commence network creation',name);

			this.$log();
			this.network = client.network.create({auth: this.$root.auth}, {name: name});
			this.network.$promise
				.then(function(resp) {
					if (201 === resp.status) {
						this.$set(network, resp.body);
						this.router.setRoute('/dashboard/' + this.network.key);
						console.log('network created!', resp);
					}
				}.bind(this),
				function(err) {
					this.$root.$set('flash', 'failed to create network: ' + err.error.message);
					console.log('failed to create network ' + err.error.message);
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

			client.device.create(this.network.key, payload, {auth: this.$root.auth})
				.$promise.then(function(resp) {
					if (201 === resp.status) {
						// simply refetch the network
						client.network
							.get(this.network.key, {auth: this.$root.auth})
							.then(function(resp) {
								if (200 === resp.status) {
									this.$set('network', resp.body);
								}
							}.bind(this));
					} else if (409 === resp.status) {
						this.$set('errors.uid', "It seems like something already occupies this address");
					} else {
						this.flashClass = "danger";
						this.flash = "Sorry, we could not create the device...\n";
						this.flash = '<pre>' + resp.text + '</pre>';
					}
				}.bind(this));
		}
	},
	computed: {
		initialsetup: function() {
			return 0 === this.networks2.length;
		},
		haschannel: function() {
			return undefined !== this.network && Object.keys(this.network.channels).length > 0;
		},
		connected: function() {
			return this.haschannel && undefined !== this.network.channels[Object.keys(this.network.channels)[0]].last;
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
			var key = Object.keys(this.network.channels)[0];
			return _.filter(("00000000" + this.network.devicemap[key].address.toString(16))
				.slice(-8, 16)
				.split(/(..)/));
		},
		nidbytes: function() {
			return _.filter(("00000000" + parseInt(this.network.key, 36).toString(16))
				.slice(-8, 16)
				.split(/(..)/));
		}
	}
};
