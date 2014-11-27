require('insert-css')(require('./app.css'))

var Vue = require('vue'),
    Router = require('director').Router,
    client = require('tinymesh-cloud-client/tinymesh-cloud-client')('http://31.169.50.34:8080'),
    store = require('store');


var vue = new Vue({
  el: '#app',
  components: {
    'user-login': require('./user/login'),
    'user-register': require('./user/register')
  },
  // require html enabled by the partialify transform
  template: require('./app.html'),
  data: {
		auth: false,
		prevAuth: store.get('prevAuth?', false),
		view: store.get('prevAuth?', false) ? 'login' : 'register'
  },
  methods: {
    onAuth: function(auth) {
      ret.data.auth = auth;
      store.set('prevAuth?', true);
    }
  }
});

var storedauth = store.get('auth');

if (storedauth) {
	 client.user.get({auth: storedauth})
		.end()
		.then(function(resp) {
			if (200 === resp.status) {
				vue.auth = vue.onAuth(resp.body);
			}
		});
}
