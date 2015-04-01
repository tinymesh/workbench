<style lang="css">
</style>

<template lang="html">
<div class="loader" v-show="loading">
	<div class="square" ></div>
	<div class="square"></div>
	<div class="square last"></div>
	<div class="square clear"></div>
	<div class="square"></div>
	<div class="square last"></div>
	<div class="square clear"></div>
	<div class="square "></div>
	<div class="square last"></div>
</div>

</template>

<script lang="js">
var toggleBodyClass = function(cssclass, cond) {
	var elem = document.getElementsByTagName("body")[0]

	if (!cond)
		elem.className = _.without(elem.classList, cssclass).join(' ')
	else
		elem.className = _.union(elem.classList, [cssclass]).join(' ')
}

module.exports = {
	data: function() {
		return {
			promises: [],
			once: true
		}
	},

	ready: function() {
		toggleBodyClass('blockloader-init', false)
		this.once = false
		document.getElementById("initial-loader").remove()
	},

	methods: {
		await: function(promise) {
			var ref = Math.random().toString()

			this.promises.push(ref)

			var clear = function(arg) {
				this.promises = _.without(this.promises, ref)
				this.setBodyState()
				return arg
			}.bind(this)

			promise.then(clear, clear)

			this.setBodyState()

			return promise
		},

		setBodyState: function() {
			toggleBodyClass('blockloader-loading', 0 !== this.promises.length)
		}
	},

	computed: {
		loading: function() {
			return this.once || 0 !== this.promises.length
		}
	}
}
</script>
