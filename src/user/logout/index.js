require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client'),
	Vue = require('vue'),
	Finch = (require('../../vendor/finch')).Finch;


Finch.route('/user/logout', function() {
	app.$set('view', 'wb-user-logout');
});

Vue.component('wb-user-logout', {
  template: require('!raw!./template.html'),
  replace: true,
  data: function () {
		return {
			subview: 'wb-user-login'
		}
	},
	ready: function() {
		var logout = client.auth.logout({auth: this.$root.$.auth.data});
		logout.$promise.then(function() {
			app.$.notify.set("You have been logged out", "warning");
			this.$root.$.auth.$set('data', {});
			this.$root.$.auth.$set('authenticated', false);
		}, function() {
			app.$.notify.set("We could not log you out at this point", "danger");
			Finch.navigate('/');
		});
	}
});
