require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash');

module.exports = {
	template: require('./template.html'),
	replace: true,
	compiled: function () {
		this.update();
		this.$watch('params.network', this.update)
		this.$watch('params.device', this.update)
	},
	data: function () {
		return {
			device: {}
		}
	},
	methods: {
		update: function() {
			var finddev = function() {
				this.device = client.device.get(this.params.network, this.params.device, {auth: this.$root.auth});
				this.device.$promise.then(function() {},
					function(resp) {
						if (404 === resp.status || 403 === resp.status) {
							this.$root.view = 'error-404';
						}
					}.bind(this));
			}.bind(this);

			if (!this.network || this.network.key !== this.params.network) {
				this.$root.user.$promise.then(function(user) {
					this.$root.networks.$promise.then(function(networks) {
						this.network = _.find(networks, {key: this.params.network});
						finddev();
					}.bind(this));
				}.bind(this));
			} else {
				finddev();
			}
		}
	}
}
