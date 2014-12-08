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
    'device': require('./device'),
    'device-overview': require('./device/overview'),
    'device-config': require('./device/config'),
//    'device-query': require('./device/query'),
    'device-interact': require('./device/interact'),
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
		params: {},
		router: new Router()
  },
  methods: {
    onAuth: function(auth) {
      app.$set('auth', auth);
      app.$set('authenticated', true);
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

var defaultroute = function(view, callback) {
	if (app.authenticated) {
		app.view = view;
		callback();
	} else
		app.view = store.get('prevAuth') ? 'user-login' : 'user-register';
};
app.router.on('/', function() {
	defaultroute('dashboard', function() {
		app.$set('params.network', undefined);
	});
});
app.router.on('/dashboard', function() {
	defaultroute('dashboard', function() {
		app.$set('params.network', undefined);
	});
});
app.router.on('/dashboard/:network', function(network) {
	defaultroute('dashboard', function() {
		app.$set('params.network', network);
	});
});
app.router.on('/user/logout', function() {
	if (store.get('auth'))
		client.auth.logout({auth: store.get('auth')});

	app.flash = "You logged out. See you soon :)";
	app.flashClass = "warning";
	app.view = 'user-login';
});

app.router.on(/device\/([^/]*)\/([^/]*)\/?(.*)$/, function(network, device, tab) {
	defaultroute('device', function() {
		app.$set('params.network', network);
		app.$set('params.device', device);
		app.$set('params.tab', tab);
	});
});

app.router.configure({
	notfound: function () {
		app.$set('view', 'error-404');
	}
});

if (storedauth) {
	app.user = client.user.get({auth: storedauth});
	app.user.$promise
		.then(function(user) {
			app.onAuth(storedauth);

			if ('#/user/logout' === window.location.hash)
				app.router.init(window.location.hash = '/');
			else if (window.location.hash)
				app.router.init(window.location.hash.replace(/^#/, ''))
			else
				app.router.init(window.location.hash = '/');

			app.networks = client.network.list({auth: storedauth});

			return resp;
		},
		function(resp) {
			console.log('err', this);
			if (401 === resp.status) {
				store.set('auth', null);
				app.flash = "You have been logged out";
				app.flashClass = "warning";
				app.router.init('/');
			} else {
				app.router.init('/');
			}
		});
} else {
	app.router.init('/');
}
