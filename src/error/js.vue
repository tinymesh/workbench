<template>
<pre>{{err|json}}</pre>
</template>

<script>
module.exports = {
	data: function() {
		return {
			err: {
				msg: "",
				url: "",
				line: -1
			}
		}
	},

	methods: {
		handle: function(msg, url, line) {
			this.err.msg = msg
			this.err.url = url
			this.err.line = line

			return true
		}
	},

	attached: function() {
		console.log('error handler attached')
	}
}
</script>
