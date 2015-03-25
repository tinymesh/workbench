<style lang="css">
/*
 * 404 Not found
 */
.not-found {
	color: white;
	position: relative; }

.not-found .not-found-screen { background-color: #2980b9; padding: 125px 0px 33px 0px; }
.not-found .not-found-container { position: relative; width: 770px; margin: 0 auto 90px; }
.not-found h1 { font-weight: bold; font-size: 4.5em; }
.not-found a { font-weight: bold; color: #fff; text-decoration: underline; cursor: pointer; }

</style>

<template lang="html">
<div class="not-found">
	<div class="not-found-screen">
		<div class="not-found-container">
			<div class="row">
				<div class="not-found-icon col-xs-4">
					<img src="./src/error/404/map.png" alt="Not found, have a map!">
				</div>

				<div class="col-xs-8">
					<h1>Oh no, I'm lost!</h1>
					<p>
						It looks like you took a wrong turn somewhere along the
						road. This does happen occasionally,
						<span v-if="history.length > 0">
						luckily you can always <a v-on="click: history.back()">go back</a>.
						</span>
						<span v-if="history.length === 0">
						are you sure you typed the correct url?
						</span>
					</p>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="js">
module.exports = {
	replace: true,
	computed: {
		history: function() {
			return window.history
		}
	}
}
</script>
