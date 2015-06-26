var Vue = require('vue')

Vue.filter('patcher', {
	write: function(value, prevVal, source) {
		return value;
	},
	read: function(value, source) {
		return value || source
	}
})
