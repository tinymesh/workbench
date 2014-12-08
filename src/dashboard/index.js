require('insert-css')(require('./style.css'));

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash');

module.exports = {
	template: require('./template.html'),
	replace: true,
	compiled: function () {
		this.update()
		this.$watch('params.network', this.update);
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

			this.network = client.network
				.create({name: this.newnetwork}, {auth: this.$root.auth});
		},
		update: function() {
			this.$root.networks.$promise.then(function(networks) {
				this.network = _.find(this.$root.networks, {key: this.$root.params.network});
				this.networks.length = networks.length;
			}.bind(this));
		}
	},
	computed: {
		hasconnected: function() {
			return undefined !== this.network.channels[Object.keys(this.network.channels)[0]].last;
		},
	}
};
