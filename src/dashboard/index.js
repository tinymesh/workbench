require('insert-css')(require('./style.css'));

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash');

module.exports = {
	template: require('./template.html'),
	replace: true,
	compiled: function () {
		this.update()
		this.$watch('params.network', this.update)
	},
	data: function() {
		return {
			key: "",
			newnetwork: "",
			network: undefined,
			errors: {}
		}
	},
	methods: {
		createNetwork: function(e) {
			e.preventDefault();

			if (!this.newnetwork)
				this.$set('errors.newnetworkname', "You need to name your network");
			else
				delete this.errors.newnetworkname;

			if (Object.keys(this.errors).length > 0)
				return;

			this.network = client.network;
			this.$promise.create({name: this.newnetwork}, {auth: this.$root.auth})
				.then(function(resp) {
					if (201 === resp.status) {
						this.$set(network, resp.body);
					}
				});
		},
		update: function() {
			if (this.$root.networks.length === 0) {
				this.$root.networks = client.network.list({auth: this.$root.$get('auth')})
				this.$root.networks.$promise
					.then(function(networks) {
						this.$root.networks = networks;
						this.network = _.find(networks, {key: this.$root.params.network});
					}.bind(this));
			} else {
				this.network = _.find(this.$root.networks, {key: this.$root.params.network});
			}
		}
	},
	computed: {
		hasconnected: function() {
			return undefined !== this.network.channels[Object.keys(this.network.channels)[0]].last;
		},
	}
};
