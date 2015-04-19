var
	Vue = require('vue'),
	_ = require('lodash')

Vue.filter('address', {
	write: function(value, prevVal) {
		console.log('write/address', value)
		return value;
	},
	read: function(value, encoding, bigEndian) {
		bigEndian = this.$get(bigEndian) || false
		var toEndian = function (list) {
			if (bigEndian)
				return list.reverse()

			return list
		}

		value = parseInt(value)

		switch (this.$get(encoding) || 'hex') {
			case 'binary':
				return toEndian([
					 value & 0xff,
					(value >> 8)  & 0xff,
					(value >> 16) & 0xff,
					(value >> 24) & 0xff,
				]).join(' . ')
				break ;;

			case 'decimal':
				return value
				break ;;

			case 'hex':
			default:
				return toEndian([
					(value & 0xff).toString(16),
					((value >> 8)  & 0xff).toString(16),
					((value >> 16) & 0xff).toString(16),
					((value >> 24) & 0xff).toString(16),
				]).join(' : ')
				break ;;
		}

		return value
	}
})

