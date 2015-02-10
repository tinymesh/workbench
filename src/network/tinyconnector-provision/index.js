require('!style!css!./style.css');

var Promise = require('../../es6-promise').Promise;

Vue.component('wb-network-tinyconnector-provision', {
	template: require('!raw!./template.html'),
	replace: true,
	data: function() {
		return {
			appId: "ekiongijgijoaliebinoaneidfclgilc",
			ports: [],
			port: undefined
		}
	},
	methods: {
		installChromeApp: function(e) {
			chrome.webstore.install();
		},
		sendMsg: function(cmd, opts) {
			var ctx = this;
			opts = opts || {};

			return new Promise(function(resolve, reject) {
				//var timer;
				//if (opts.timeout) {
				//	timer = setTimeout(function() {
				//		console.log('tinyconnector-err: timeout....');
				//		reject(ctx, {error: "timeout"});
				//	}, opts.timeout || 5000);
				//}

				ctx.$root.msgChromeApp(cmd, function(resp) {
					console.log("i'get-resp", resp);
					//timer && clearTimeout(timer);

					if (opts.callback)
						opts.callback();

					resolve.call(ctx, resp);
				});

			});
		}
	},
});
