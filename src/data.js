    _ = require('lodash');
var Vue = require('vue'),
    store = require('store'),
    client = require('tinymesh-cloud-client/tinymesh-cloud-client');

var addDashboardRoute = require('./dashboard');

// Authentication storage and methods
Vue.component('wb-auth', {
	name: 'auth',
	created: function () {
		console.log('created auth', this);
	},
	data: function() {
		return {
			data: {},
			authenticated: false
		};
	},
	methods: {
		onAuth: function(auth) {
			store.set('prevAuth?', true);
			store.set('auth', auth);


			this.$set('data', auth);
			this.$set('authenticated', true);
			this.$root.$.data.networks = client.network.list({auth: auth});

			console.log(addDashboardRoute());
			if ('#/user/logout' === window.location.hash)
				Finch.navigate('/');
			else
				Finch.reload();
		}
	},
});

Vue.component('wb-notify', {
	name: 'notify',
	template: "#notifytpl",
	created: function () {
		console.log('created notify', this);
	},
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
	created: function () {
		console.log('created data', this);
	},
	data: function() {
		return {
			params: {},

			network: undefined,
			networks: [],

			user: undefined,
		};
	}
});


