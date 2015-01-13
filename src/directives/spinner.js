var _ = require('lodash'),
    Spinner = require('../vendor/spin');

var defaults = {
	lines: 13, // The number of lines to draw
	length: 3, // The length of each line
	width: 2, // The line thickness
	radius: 2, // The radius of the inner circle
	corners: 1, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	direction: 1, // 1: clockwise, -1: counterclockwise
	color: '#fff', // #rgb or #rrggbb or array of colors
	speed: 1, // Rounds per second
	trail: 60, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: true, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: '10px',// Top position relative to parent
	left: '0px' // Left position relative to parent
};

Vue.directive('wb-spinner', {
	bind: function (args) {
		var opts = defaults;
		this.spinner = new Spinner(opts);
		this.el.style.position = 'relative';
		this.el.style.width  = '15px';
		this.el.style.height = '15px';
		this.el.style.display = 'none';
	},
	update: function (newValue, oldValue) {
		if (newValue) {
			this.spinner.spin();
			this.el.appendChild(this.spinner.el);
			this.el.style.display = 'inline-block';
		} else {
			this.spinner.stop();
			this.el.style.display = 'none';
		}
	},
	unbind: function () {
		delete this.spinner;
	}
})

//(function() {
//
//
//	module.exports = function(el, promise, opts) {
//		opts = _.merge(_.clone(opts), defaults);
//
//		var spinner = new Spinner().spin();
//		el.appendChild(spinner.el);
//
//		if (promise.$promise)
//			promise = promise.$promise;
//
//		promise.done(function() {
//			spinner.stop();
//			delete spinner;
//		});
//	};
//});
