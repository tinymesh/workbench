<style lang="css">
</style>
<template lang="html">
	<div class="container-fluid">
		<div
			v-if="!notFound"
			v-component="help-{{params.topic}}"> </div>

		<div v-if="params.topic && notFound">
			<div class="page-header">
				<h1>I can't help you</h1>
			</div>

			<p>
				The help <code>`{{params.topic}}`</code> was not found.
			</p>
		</div>

		<div v-if="!params.topic">
			<div class="page-header">
				<h1>No help topic specified</h1>
			</div>

			<p>
				You need to specify a topic you want help with.
			</p>
		</div>
	</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	Finch = (require('./vendor/finch')).Finch,
	store = require('store')

var route = function(args) {
	app.$set('view', 'help');
	app.$.data.$set('params.topic', args.topic)
}

module.exports = {
	init: function() {
		Finch.route('/help', route)
		Finch.route('/help/:topic', route)
		return this;
	},

	components: {
		'help-device-configuration': require('./help/device-configuration.vue')
	},

	computed: {
		params: function() {
			return this.$root.$.data.params
		},

		notFound: function() {
			return undefined === this.$options.components['help-' + this.params.topic]
		},
	}
}
</script>
