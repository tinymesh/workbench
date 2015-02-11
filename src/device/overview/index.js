require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client'),
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
	},
	computed: {
		gpios: function() {
			var config = this.device['proto/tm'].config;
			if (config) {
				return [
					config.gpio_0, config.gpio_1, config.gpio_2,
					config.gpio_3, config.gpio_4, config.gpio_5,
					config.gpio_6, config.gpio_7];
			} else {
				return [];
			}
		}
	}
}
