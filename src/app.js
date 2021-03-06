require('!style!css!./app.css');

Vue = require('vue');
var client = require('tinymesh-cloud-client'),
    store = require('store'),
	 pace = require('pace'),
    _ = require('lodash');
    Finch = (require('./vendor/finch')).Finch;


client.$config.set('endpoint', 'https://http.cloud.tiny-mesh.com/v1');
//client.$config.set('endpoint', 'http://localhost:4000');

pace.start({
	ajax: {
		trackMethods: ["GET", "PUT", "POST", "DELETE"]
	}
});

require('./data');
require('./directives/spinner');
require('./directives/modal');
require('./directives/fuzzy-date');
require('./landingpage');
require('./user/login');
require('./user/logout');
require('./user/register');

require('./filters');


//chrome.runtime.sendMessage('ekiongijgijoaliebinoaneidfclgilc',
//	'ping',
//	function(resp) {
//		console.log(resp);
//		hasChromeApp = 'pong' === resp;
//	});

var
	hasChromeApp = false;

//Vue.config.debug = true;
var navigation = require('./navigation.vue').init(navigation)
app = new Vue({
	el: '#app',
	// require html enabled by the partialify transform
	template: require('!raw!./app.html'),

	compiled: function() {
		this.msgChromeApp({command: "ping"}, function(resp) {
			hasChromeApp = 'pong' === resp.ping;
		});

	},

	components: {
		'dashboard': require('./dashboard.vue').init(navigation),
		'organization': require('./organization.vue').init(navigation),
		'device': require('./device.vue').init(navigation),
		'wb-blockloader': require('./util/blockloader.vue'),
		'wb-navigation': navigation,
		'not-found': require('./error/404.vue')
	},

	data: {
		view: undefined,
		modal:{
			comp: undefined,
			show: false,
			dismissable: true
		},
		notFound: false
	},

	methods: {
		msgChromeApp: function(msg, callback) {
		}
	},

	computed: {
		isChrome: function() {
			var isChromium = window.chrome,
				vendorName = window.navigator.vendor;
			return isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.";
		},

		hasChromeApp: function() {
			return hasChromeApp;
		},

		chromePort: function() {
			return chromePort;
		},

		platform: function() {
			//if (this.isChrome)
			//	return "chrome";

			var match = navigator.platform.replace(/^([a-zA-Z]*).*$/, '$1').toLowerCase()
			if (match.match(/^mac/))
				return "mac";

			return match;
		}
	}
});

Finch.route('/', function() {
	app.$set('view', 'wb-landingpage');
});

Finch.listen();

var auth = store.get('auth');

if (auth) {
	app.$.auth.onAuth(
		auth,
		function(user) {
			if ('#/user/logout' === window.location.hash)
				Finch.navigate('/');
			else if (window.location.hash)
				Finch.navigate(window.location.hash.replace(/^#/, ''));
			else
				Finch.navigate('/');

			return resp;
		},
		function(resp) {
			if (401 === resp.status) {
				store.set('auth', null);
				app.$.data.notify.set("You have been logged out", "warning");
			}

			Finch.navigate('/');
		}
	)
} else {
	Finch.navigate('/');
}

