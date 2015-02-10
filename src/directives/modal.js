var Vue = require('vue');

var addClass = function( elem, name ) {
	elem.className = elem.className.replace( /\s+$/gi, '' ) + ' ' + name;
}

var removeClass = function(elem, name) {
	elem.className = elem.className.replace( name, '' );
}

Vue.directive('wb-modal', {
	bind: function () {},
	update: function (newValue, oldValue) {
		if (newValue) {
			addClass(this.el, 'active');
		} else if(!newValue) {
			removeClass(this.el, 'active');
		}
	},
	unbind: function () {}
})
