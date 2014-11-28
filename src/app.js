require('insert-css')(require('./app.css'))


var Vue = require('vue'),
    Router = require('director').Router,
    client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
    store = require('store'),
	 pace = require('pace'),
    _ = require('lodash');


client.$config.set('endpoint', 'http://localhost:4000');

pace.start({
	ajax: {
		trackMethods: ["GET", "PUT", "POST", "DELETE"]
	}
});

var app = new Vue({
  el: '#app',
  components: {
    'user-login': require('./user/login'),
    'user-register': require('./user/register'),
    'user-logout': require('./user/logout'),
    'error-404': require('./error/404'),
    'dashboard': require('./dashboard'),
    'network-setup-guide': require('./network/setup-guide')
  },
  // require html enabled by the partialify transform
  template: require('./app.html'),
  data: {
		auth: false,
		authenticated: false,
		prevAuth: store.get('prevAuth?', false),
		view: '',
		networks: [],
		user: undefined,
		flash: "",
		flashClass: "warning",
		params: {}
  },
  methods: {
    onAuth: function(auth) {
      app.auth = auth;
      app.authenticated = true;
      store.set('prevAuth?', true);
      store.set('auth', auth);
    }
  },
  directives: {
    'fuzzy-date': require('./directives/fuzzy-date.js'),
    'address': require('./directives/address.js'),
  }
});

var storedauth = store.get('auth');

var route = new Router();
var defaultroute = function(view, callback) {
	if (app.authenticated) {
		app.view = view;
		callback();
	} else
		app.view = store.get('prevAuth') ? 'user-login' : 'user-register';
};
route.on('/', function() {
	defaultroute('dashboard', function() {
		app.$set('params.network', undefined);
	});
});
route.on('/dashboard', function() {
	defaultroute('dashboard', function() {
		app.$set('params.network', undefined);
	});
});
route.on('/dashboard/:network', function(network) {
	defaultroute('dashboard', function() {
		app.$set('params.network', network);
	});
});
route.on('/user/logout', function() {
	client.auth.logout({auth: store.get('auth')})
		.then(function(resp) {
			if (205 === resp.status || 401 === resp.status || 403 === resp.status) {
				app.flash = "You logged out. See you soon :)";
				app.flashClass = "warning";
				app.view = 'user-logout';
			}
		});
});
route.configure({
	notfound: function () {
		app.$set('view', 'error-404');
	}
});

if (storedauth) {
	 client.user.get({auth: storedauth})
		.then(function(resp) {
			if (200 === resp.status) {
				app.user = resp.body;
				app.onAuth(storedauth);
				if ('#/user/logout' === window.location.hash)
					route.init('/')
				else if (window.location.hash)
					route.init(window.location.hash.replace(/^#/, ''))
				else
					route.init('/')

				window.reload();
			} else if (401 === resp.status) {
				store.set('auth', null);
				app.flash = "You have been logged out";
				app.flashClass = "warning";
				route.init('/');
			} else {
				route.init('/');
			}
		});
} else {
	route.init('/');
}
