require('!style!css!./app.css');

Vue = require('vue');
var client = require('tinymesh-cloud-client'),
    store = require('store'),
	 pace = require('pace'),
    _ = require('lodash');
    Finch = (require('./vendor/finch')).Finch;


client.$config.set('endpoint', 'http://http.cloud.tiny-mesh.com:8080');
//client.$config.set('endpoint', 'http://localhost:4000');

pace.start({
	ajax: {
		trackMethods: ["GET", "PUT", "POST", "DELETE"]
	}
});

require('./data');
require('./directives/spinner');
require('./directives/modal');
require('./directives/address');
require('./directives/fuzzy-date');
require('./navigation');
require('./dashboard');
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

var chromePort = chrome.runtime.connect('ekiongijgijoaliebinoaneidfclgilc', {name: "tinyconnector"});
var hasChromeApp = false;
chromePort.onDisconnect.addListener(function(port) {
	// extension reloaded or crashed....
	console.log('disconnect', port);
});

chromePort.onMessage.addListener(function(msg) {
	console.log('msg', msg);
});

var callbackOnId = function(ev, id, callback) {
	var listener = ( function(port, id) {
		var handler = function(msg) {
			console.log('recv msg', id, msg);
			if (msg.id === id) {
				ev.removeListener(handler);
				callback(msg);
			}
		}

		return handler;

	})(ev, id, callback);
	ev.addListener(listener);
};

//Vue.config.debug = true;
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
		'device': require('./device.vue').init()
	},
	data: {
		view: undefined,
		modal:{
			comp: undefined,
			show: false,
			dismissable: true
		}
	},
	methods: {
		msgChromeApp: function(msg, callback) {
			if (callback) {
				var id = Math.random().toString(36);
				callbackOnId(this.chromePort.onMessage, id, callback);
				msg.id = id;
			}

			console.log('postMsg', id);
			this.chromePort.postMessage(msg);
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

Finch.route('/', function() { app.$set('view', 'wb-landingpage'); });

Finch.listen();

var auth = store.get('auth');

if (auth) {
	app.$.data.user = client.user.get({auth: auth});
	app.$.data.user.$promise
		.then(function(user) {
			app.$.auth.onAuth(auth);

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
		});
} else {
	Finch.navigate('/');
}

