var Vue = require('vue')

Vue.filter('patcher', {
	write: function(value, prevVal, param, target, source) {
		if (undefined === target[param])
			target.$add(param, value)
		else
			target.$set(param, value)

		return target
	},

	read: function(value, param, target, source) {
		return undefined !== value[param] ? value[param] : source[param]
	}
})
