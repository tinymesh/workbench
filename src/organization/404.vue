<style lang="css">
</style>

<template lang="html">
	<div class="row">
		<div class="container-fluid">
			<div class="page-header">
				<h3>Ooops, I can't find that page</h3>
			</div>

			<div class="content" v-if="$parent.tabFound">
				The organization you tried to view was either not found or
				you don't have permissions to access it.
			</div>
			<div class="content" v-if="!$parent.tabFound">
				The view <code>{{$parent.params.tab}}</code> is not available. Are you sure you
				typed it correctly?
			</div>
		</div>
	</div>
</template>
