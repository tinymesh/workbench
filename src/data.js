    _ = require('lodash');
var Vue = require('vue'),
    store = require('store'),
    client = require('tinymesh-cloud-client');

// Authentication storage and methods
Vue.component('wb-auth', {
	name: 'auth',

	data: function() {
		return {
			data: client.auth.login({future: true}),
			authenticated: false
		};
	},

	ready: function() {
		client.$config.set('onUnauthorized', function() {
			this.$set('authenticated', false)
			this.$root.$set('view', 'wb-landingpage')
		}.bind(this))
	},

	methods: {
		onAuth: function(auth, onUser, onUserErr) {
			delete auth.$promise; // not serializable
			store.set('prevAuth?', true);
			store.set('auth', auth);


			this.$set('data', auth);
			this.$set('authenticated', true);

			this.$root.$.data.networks.$fulfil({auth: auth});
			this.$root.$.loader.await(this.$root.$.data.networks.$promise)

			this.$root.$.data.user = client.user.get({auth: auth});
			this.$root.$.data.user.$promise.then(function(user) {
				this.$root.$broadcast('user:auth', user)
				onUser && onUser(user)
			}.bind(this), onUserErr);
			this.$root.$.loader.await(this.$root.$.data.user.$promise)

			setTimeout(function() {
				this.$set('autenticated', false)
			}.bind(this), (parseInt(this.data.ttl) * 1000) - new Date().getTime())

			if ('#/user/logout' === window.location.hash)
				Finch.navigate('/');
			else
				Finch.reload();
		}
	}
});

Vue.component('wb-notify', {
	name: 'notify',
	template: "#notifytpl",
	methods: {
		set: function(msg, cssclass) {
			this.messages = [{
				message: msg,
				cssclass: cssclass
			}];
		},
		add: function(msg, cssclass) {
			this.messages.unshift({
				message: msg,
				cssclass: cssclass
			});
		},
		remove: function(ref) {
			delete this.messages[ref];
		},
		clear: function() {
			this.messages = [];
		}
	},
	data: function() {
		return {
			messages: []
		};
	},
});

// Shared data for all components
Vue.component('wb-data', {
	name: 'data',
	compiled: function() {
		// This is completely fucked.......
		// the `networks` key is cursed!!!!
		this.$watch('params.network', function(key) {
			this.networks.$promise.then(function(networks) {
				this.network = _.find(networks, {key: key});
			}.bind(this));
		});
	},
	data: function() {
		return {
			params: {
				address_encoding: 'hex',
				address_big_endian: false,
			},

			network: undefined,
			networks: client.network.list({future: true}),

			user: {
				name: "",
				email: ""
			}
		};
	},
	computed: {
		hasNetworks: function() {
			return this.networks.length > 0;
		},
		initialSetup: function() {
			if (undefined !== store.get('skipInitialSetup')) {
				// allow resetting skipInitialSetup
				return !store.get('skipInitialSetup');
			} else if (!this.hasNetworks) {
				return true;
			} else if (1 === this.networks.length) {
				return !_.any(this.networks, function(net) {
					return net.haveConnected();
				});
			}

			return false;
		},
		setupSkipped: function() {
			return true === store.get('skipInitialSetup');
		}
	},
	methods: {
		skipInitialSetup: function(e) {
			e.preventDefault();
			store.set('skipInitialSetup', true);
		}
	}
});


