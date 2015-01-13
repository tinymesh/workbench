Vue.component('wb-landingpage', {
	template: require('./template.html'),
	created: function () {
		console.log('created view: landingpage', this);
	},
	data: function() {
		return {
			subview: 'wb-user-login'
		};
	}
});
