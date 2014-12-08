require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash');

module.exports = {
	template: require('./template.html'),
	replace: true,
	compiled: function () {
	},
	data: function () {
		return {
			device: {}
		}
	}
}
