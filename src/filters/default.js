var
	Vue = require('vue'),
	_ = require('lodash')

Vue.filter('default', {
	write: function(value, prevVal) {
		return value;
	},
	read: function(value, defaultVal) {
		if (undefined === value || null === value) {
			return defaultVal.match(/^["'].*["']$/) ? eval(defaultVal) : defaultVal
		}

		return value
	}
})
