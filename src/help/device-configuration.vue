<template lang="html">
	<div class="page-header">
		<h3>Configuration Options</h3>
	</div>


	<div class="topics">
		<div class="header row">
			<div class="col-xs-3">
				<b>Field Name</b>
			</div>
			<div class="col-xs-2">
				<b>Field Key</b>
			</div>
			<div class="col-xs-7">
				<b>Field Value</b>
			</div>
		</div>
		<hr />

		<div class="topic row" v-repeat="field: fields">
			<div class="col-xs-3">
				<b>{{field.name}}</b>
			</div>
			<div class="col-xs-2">
				<em>{{field.key}}</em>
			</div>

			<div class="col-xs-7">
				<span v-if="field.range"><code><b>Range</b>: {{field.range[0]}} ..  {{field.range[1]}}</code></span>
				<span v-if="field.enum"><code><b>Enumerated</b>: {{field.enum | json}}</code></span>
				<span v-if="field.set"><code><b>Set</b></code></span>
				<span v-if="!field.range && !field.enum && !field.set"><code><b>String</b></code></span>


				<span v-if="field.size"><code>(size: {{field.size}})</code></span>
				<span v-if="field.ro"><code>(read-only)</code></span>
				<span v-if="field.since"><code>(since version: {{field.since}})</code></span>
				<span v-if="field.before"><code>(before version: {{field.before}})</code></span>
			</div>
		</div>
	</div>

</template>

<script lang="js">
var config = JSON.parse(require('!raw!../device/config/0.4.0.json'))
var fieldDefs = JSON.parse(require('!raw!../device/config/0.4.0-names.json'))

var cfgparams = _.reduce(config, function(acc, group, key) {
	_.each(group, function(val) {
		val.name = fieldDefs[val.key].name; acc.push(val);
	})

	return acc
}, [])


module.exports = {
	computed: {
		fields: function() {
			return cfgparams;
		}
	}
}
</script>
