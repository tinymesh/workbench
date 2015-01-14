require('insert-css')(require('./style.css'));

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	Finch = (require('../vendor/finch')).Finch;

require('../network/setup-guide');


var route = function(args) {
	app.$set('view', 'dashboard');
	app.$.data.$set('params.network', args.nid);
	app.$.data.$set('params.tab', args.tab);

	// Resume setup guide if not completed
	if (!args.nid && app.$.data.initialSetup) {
		app.$.data.networks.$promise
			.then(function(networks) {
				if (networks[0]) {
					app.$.data.$set('params.network', networks[0].key);
					Finch.navigate('/dashboard/' + networks[0].key);
				}
			});
	}
};

Finch.route('/dashboard', route);
Finch.route('/dashboard/:nid', route);
Finch.route('/dashboard/:nid/:tab', route);

Vue.component('dashboard', {
	template: require('./template.html'),
	data: function() {
		return {}
	},
	computed: {
		params: function() {
			return this.$root.$.data.params;
		}
	}
});

// add export to route after auth, bit messy but fuck yeah!
module.exports = function() {
	return Finch.route('/', route);
};
