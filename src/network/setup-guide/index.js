require('!style!css!./style.css');

require('../tinyconnector-provision');

var client = require('tinymesh-cloud-client'),
    Vue = require('vue'),
    _ = require('lodash'),
    Promise = require('../../es6-promise');

Vue.component('wb-network-setup-guide', {
	template: require('!raw!./template.html'),
	replace: true,
	inherit: true,
	compiled: function() {
		switch (this.$root.platform) {
			case "chrome":
			case "win":
			case "linux":
			case "mac":
				this.configureTab = this.$root.platform;
				break;
		}
	},
	data: function() {
		return {
			newnetwork: "",
			channelname: "",
			channeluid: "1",
			errors: {},
			channelPromise: undefined,
			networkPromise: undefined,
			configureTab: this.$root.platform,
			provisionWithChrome: false,
			view: {
				helpText: false
			}
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
						if (this.$parent.$.notify)
							this.$parent.$.notify.set('Channel was created, try refreshing if the page does not move on', 'success')
						// data is not synced correctly, fix later and just
						// refresh now
						location.reload()
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
		},
		provisionWithChrome: function(e, nid, uid) {
			e.preventDefault();

			this.$root.modal.show = true;
			this.$root.modal.comp = 'wb-network-tinyconnector-provision';

//			var callback = function(resp) {
//				// just reload the entire thing...
//				return this.network.$get({auth: this.$root.$.auth.data})
//			};
//
//			this.channelPromise = this.launchChromeApp(e, {
//				command: 'provision',
//				provision: {
//					nid: nid,
//					uid: uid,
//					type: uid ? 'provision' : 'auto-provision'
//				}
//			}, callback).then(function(resp) {
//				switch (resp.status) {
//					case "connected":
//						this.$root.$.notify.set('Provision was succesfull', 'success');
//						break;
//
//					case "provisioned":
//						this.$root.$.notify.set('Device provisioned, but could not connect', 'warning');
//						break;
//
//					case "wait-for-config":
//						this.$root.$.notify.set('wait for config button', 'warning');
//						break;
//
//					case "no-port":
//						this.$root.$.notify.set('no port selected', 'warning');
//						break;
//
//					default:
//						this.$root.$.notify.set('An error occured. Unexpected return status: ' + resp.status, 'danger');
//						break;
//				}
//			});
		},
		callChromeApp: function(e, cmd, opts) {
			/*
			 * Provision by using the chrome app
			 *
			 * # Provision command:
			 *
			 * Send a command of the form:
			 * ```
			 * {
			 * 	nid: (integer) the network id as a number
			 * 	uid: (integer|undefined) the uid of the gateway, use
			 * 	     undefined to autodetect (will trigger a 'provisioned'
			 * 	     response)
			 *    type: 'auto-provision' | 'provision'
			 * }
			 * ```
			 *
			 * The provisioning works in two ways:
			 * "auto-provision" -> By automatically detecting the UID of gateway and setting NID manually
			 * "provision"      -> By giving a specific UID and NID to the device
			 *
			 * The response is an object of the form:
			 * ```
			 * {
			 * 	"status": "connected" | "provisioned"  | "wait-for-config" | "no-port",
			 * 	"ports": [], // list of serial ports (for status := "no-port")
			 * 	"port": {}, //  port object  (for all status !src/network/setup-guide/index.js= * 	"no-port")
			 * 	"device": {}, // device info containing nid & uid (for * 	status := ("provisioned" || "connected")),
			 * }
			 * ```
			 */

			var ctx = this;
			opts = opts || {};

			return new Promise(function(resolve, reject) {
				if (!this.$root.hasChromeApp)
					return;

				if (opts.timeout) {
					var timer = setTimeout(function() {
						console.log('tinyconnector-err: timeout....');
						reject(ctx, new Error('timeout'));
					}, opts.timeout || 5000)
				}

				console.log('tinyconn-req: ', msg);
				this.$root.msgChromeApp(cmd, function(resp) {
					console.log('tinyconnector-resp: ', resp, this);
					if (opts.callback)
						opts.callback();

					resolve.call(ctx, resp);
				});

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
