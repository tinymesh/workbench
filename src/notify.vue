<template lang="html">
	<div v-show="messages.length > 0">
		<div v-if="messages.length > 0" v-attr="'class': 'alert alert-dismissible alert-' + (messages[0].cssclass || 'warning')">
			<button type="button" class="close" v-on="click: messages.shift()"><span>&times;</span></button>
			<span class="capitalize bold">{{messages[0].cssclass || "warning"}}:</span>
			<span class="notification">{{messages[0].message}}</span>
			<span v-if="messages.length > 1"class="label label-info">
				+ {{messages.length - 1}} more
			</span>
		</div>
	</div>
</template>

<script lang="js">
module.exports = {
	name: 'notify',

	data: function() {
		return {
			messages: []
		};
	},

	methods: {
		set: function(msg, cssclass) {
			this.messages = [{
				message: msg,
				cssclass: cssclass
			}];
		},
		add: function(msg, cssclass) {
			this.messages.unshift({
				message: msg,
				cssclass: cssclass
			});
		},
		remove: function(ref) {
			delete this.messages[ref];
		},
		clear: function() {
			this.messages = [];
		}
	},
}
</script>
