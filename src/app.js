require('insert-css')(require('./app.css'))

var Vue = require('vue'),
    Router = require('director').Router,
    client = require('tinymesh-cloud-client/tinymesh-cloud-client')('http://127.0.0.1:4000'),
    //client = require('tinymesh-cloud-client/tinymesh-cloud-client')('http://31.169.50.34:8080'),
    store = require('store');


var app = new Vue({
  el: '#app',
  components: {
    'user-login': require('./user/login'),
    'user-register': require('./user/register'),
    'error-404': require('./error/404')
  },
  // require html enabled by the partialify transform
  template: require('./app.html'),
  data: {
		auth: false,
		prevAuth: store.get('prevAuth?', false),
		view: store.get('prevAuth?', false) ? 'user-login' : 'user-register'
  },
  methods: {
    onAuth: function(auth) {
      app.$set('auth', auth);
      app.$set('authenticated', true);
      store.set('prevAuth?', true);
      store.set('auth', auth);
    }
  }
});

var storedauth = store.get('auth');

var route = new Router();
route.on('/dashboard', function() {
	console.log('dashboard excplicit');
	app.$set('view', 'dashboard');
});
route.configure({
	notfound: function () {
   	console.log("not found");
		app.$set('view', 'error-404');
	}
});

if (storedauth) {
	 client.user.get({auth: storedauth})
		.end()
		.then(function(resp) {
			if (200 === resp.status) {
				app.onAuth(storedauth);
				route.init(window.location.hash || '/dashboard');
			} else if (401 === resp.status) {
				store.set('auth', null);
			}
		})
}
