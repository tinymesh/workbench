require('insert-css')(require('./style.css'));

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	Finch = (require('../vendor/finch')).Finch;



var route = function(args) {
	app.$set('view', 'dashboard');
	app.$.data.$set('params.network', args.nid);
	app.$.data.$set('params.tab', args.tab);
};

Finch.route('/dashboard', route);
Finch.route('/dashboard/:nid', route);
Finch.route('/dashboard/:nid/:tab', route);

Vue.component('dashboard', {
	template: require('./template.html'),
	created: function () {
		console.log('created view: dashboard', this);
	},
	compiled: function () {
		this.update();
	},
	data: function() {
		return {
			newnetwork: "",
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
			//this.params2 = this.$root.params;
			//if (this.networks2.$promise && this.params.network)
			//	this.networks2.$promise.then(function(networks) {
			//		this.network = _.find(this.networks2, {key: this.params.network});
			//	}.bind(this));
		}
	},
	computed: {
		hasconnected: function() {
			if (this.network)
				return undefined !== this.network.channels[Object.keys(this.network.channels)[0]].last;

			return false;
		},
	}
});

module.exports = function() {
	return Finch.route('/', route);
};
