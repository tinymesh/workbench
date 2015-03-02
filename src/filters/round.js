var
	Vue = require('vue'),
	_ = require('lodash')

Vue.filter('round', {
	write: function(value, prevVal, precision) {
		return value;
	},
	read: function(value, precision) {
		if (_.isNumber(value) && !_.isNaN(value)) {
			var factor = Math.pow(10, parseInt(precision))
			return Math.round(value * factor) / factor
		} else {
			return null
		}
	}
})
