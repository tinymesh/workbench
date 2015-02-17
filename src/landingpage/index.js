var
	Vue = require('vue'),
	dashboard = require('../dashboard.vue')

Vue.component('wb-landingpage', {
	template: require('!raw!./template.html'),
	events: {
		'user:auth': function(user) {
			Finch.route('/', dashboard.route)
			Finch.reload()
		}
	},
	data: function() {
		return {
			subview: 'wb-user-login'
		};
	}
});
