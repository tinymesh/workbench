Vue.directive('wb-address', {
	bind: function (args) { },
	update: function (newValue, oldValue) {
		if (!newValue)
			return;

		var val = "0" + parseInt(newValue).toString(16)
		val = val.slice(0 + (val.length % 2))

		switch ((this.el.attributes[this.name + "-endian"] || {}).value || "little") {
			case "normal":
			case "big":
				this.el.innerText = ["0","0","0","0"].concat(val.split(/(..)/))
					.filter(function(part) { return !!part.match(/^[a-z0-9]+$/) })
					.map(function(part) { return ("0" + part).slice(-2,4); })
					.slice(-4)
					.join(' : ')
				break

			case "little":
			default:
				this.el.innerText = val
					.split(/(..)/)
					.reverse()
					.concat(["0", "0", "0", "0"])
					.filter(function(part) { return !!part.match(/^[a-z0-9]+$/) })
					.map(function(part) { return ("0" + part).slice(-2,4); })
					.slice(0, 4)
					.join(' : ')
				break
		}
	},
	unbind: function () { }
})
