require('insert-css')(require('./app.css'))

Vue = require('vue');
var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
    store = require('store'),
	 pace = require('pace'),
    _ = require('lodash');
    Finch = (require('./vendor/finch')).Finch;


//client.$config.set('endpoint', 'http://31.169.50.34:8080');
client.$config.set('endpoint', 'http://localhost:4000');

pace.start({
	ajax: {
		trackMethods: ["GET", "PUT", "POST", "DELETE"]
	}
});

require('./data');
require('./directives/spinner');
require('./navigation');
require('./dashboard');
require('./landingpage');
require('./user/login');
require('./user/logout');
require('./user/register');



//Vue.config.debug = true;
app = new Vue({
	el: '#app',
	// require html enabled by the partialify transform
	template: require('./app.html'),
	data: {
		view: undefined
	},
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

