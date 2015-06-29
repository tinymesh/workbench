require('!style!css!./app.css');

var
	Vue = require('vue'),
	Router = require('vue-router'),
	client = require('tinymesh-cloud-client'),
	store = require('store'),
	pace = require('pace'),
	_ = require('lodash');

client.$config.set('endpoint', 'https://http.cloud.tiny-mesh.com/v1');
//client.$config.set('endpoint', 'http://local.tiny-mesh.com:8080/test');
//client.$config.set('endpoint', 'http://localhost:4000');


pace.start({
	ajax: {
		trackMethods: ["GET", "PUT", "POST", "DELETE"]
	}
});



Vue.use(Router)
var router = new Router({
	history: true,
	hashbang: true,
	root: window.location.pathname
})

var routes = require('./routes.js')
router.map(routes)

routego = function(path) {
	console.log('route-> ' + path)
	router.go(path, {history: true})
}

Vue.config.debug = true;
app = Vue.extend({
	el: function() { return '#app' },

	components: {
		'wb-data': require('./data'),
		'wb-auth': require('./auth'),
		'wb-notify': require('./notify.vue'),
		'wb-blockloader': require('./util/blockloader.vue'),
		'wb-navigation': require('./navigation.vue'),

		'user': require('./user.vue'),
		'user-login': require('./user/login.vue'),
		'user-logout': require('./user/logout.vue'),
		'user-register': require('./user/register.vue'),

		'landingpage': require('./landingpage.vue'),
		'dashboard': require('./dashboard.vue'),
		'organization': require('./organization.vue'),
		'device': require('./device.vue'),
		'help': require('./help.vue'),
		'not-found': require('./error/404.vue')
	},

	filters: require('./filters'),
	directives: require('./directives.js'),

	data: function() {
		return {
			view: undefined,
			containercss: "",
			modal:{
				comp: undefined,
				show: false,
				dismissable: true
			},
			notFound: false
		}
	},

	ready: function() {
		var auth = store.get('auth');

		if (auth) {
			this.$.auth.onAuth(
				auth,
				function(user) {
					// add redirect
					router.redirect({'/': '/dashboard'})
				},
				function(resp) {
					if (401 === resp.status) {
						store.set('auth', null);
						app.$.data.notify.set("You have been logged out", "warning");
					}
				}
			)
		}

		// setup error handling
		//handler = this.$.jserror
		//window.onerror = function(msg, url, line) {
		//	if (handler)
		//		return handler.handle(msg, url, line)

		//	return false
		//}
	},

	methods: {
		toggleBodyClass: function(classmap) {
			var elem = document.getElementsByTagName("body")[0]

			var classes = elem.classList

			_.each(classmap, function(cond, cssclass) {
				if (!cond)
					classes = _.without(classes, cssclass)
				else
					classes = _.union(classes, [cssclass])
			})

			elem.className = classes.join(' ')
		},

		purgecache: function(resource) {
			console.log(resource)
			if (!resource.$cachekey)
				return

			console.log('cache: purge key: ' + key.$cachekey)
			store.remove(key)

		}
	},

	computed: {
		routes: function() {
			return routes;
		},

		validView: function() {
			return undefined !== this.$options.components[this.view]
		},

		isChrome: function() {
			var isChromium = window.chrome,
				vendorName = window.navigator.vendor;
			return isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.";
		},

		platform: function() {
			var match = navigator.platform.replace(/^([a-zA-Z]*).*$/, '$1').toLowerCase()
			if (match.match(/^mac/))
				return "mac";

			return match;
		}
	}
});

//router.beforeEach(function(to, from, allow, deny) {
//	console.log('route/before:')
//	console.log(from)
//	allow()
//})

router.afterEach(function(to, from) {
})



router.start(app, "#app")
