var
	Vue = require('vue')

Vue.filter('viewMore', {
	write: function(value, prevVal, num, statevar) {
		return value;
	},
	read: function(value, num, statevar) {
		num = parseInt(num)
		if (this.$get(statevar))
			return value
		else
			return value.slice(0, num)
	}
})

