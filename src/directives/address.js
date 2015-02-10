Vue.directive('wb-address', {
	bind: function (args) { },
	update: function (newValue, oldValue) {
		if (!newValue)
			return;

		var parts = _.map(_.filter(("0000000" + newValue.toString(16)).substr(-8, 8).split(/^(..)(..)(..)(..)$/g)),
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
	},
	unbind: function () { }
})
