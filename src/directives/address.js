(function() {
	var _ = require('lodash');
	module.exports = function(uid){
		if (!uid)
			return;

		var parts = _.map(_.filter(("0000000" + uid.toString(16)).substr(-8, 8).split(/^(..)(..)(..)(..)$/g)),
			function(m) { return parseInt(m, 16).toString(); });


		switch ((this.el.attributes[this.name + "-endian"] || {}).value || "little") {
			case "normal":
			case "big":
				this.el.innerText = parts.join('.')
				break;

			case "little":
			default:
				this.el.innerText = parts.reverse().join('.')
				break;
		}
	};
})();
