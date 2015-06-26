var
	_ = require('lodash'),
	client = require('tinymesh-cloud-client')

module.exports = {
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
			return this.networks.length > 0
		},
		initialSetup: function() {
			if (undefined !== store.get('skipInitialSetup')) {
				// allow resetting skipInitialSetup
				return !store.get('skipInitialSetup')
			} else if (!this.hasNetworks) {
				return true;
			} else if (1 === this.networks.length) {
				return !_.any(this.networks, function(net) {
					return net.haveConnected()
				})
			}

			return false;
		},
		setupSkipped: function() {
			return true === store.get('skipInitialSetup')
		}
	},
	methods: {
		skipInitialSetup: function(e) {
			e.preventDefault()
			store.set('skipInitialSetup', true)
		}
	}
}


