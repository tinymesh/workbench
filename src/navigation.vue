<style lang="css">
</style>

<template lang="html">
	<nav class="navbar" role="navigation">
		 <div class="container-fluid">
				<div class="navbar-header col-xs-2">
					 <a href="./index.html" class="navbar-brand">Tiny Mesh Cloud</a>
				</div>
				<nav class="col-xs-10" role="navigation">
					 <ul class="nav main navbar-nav">
							<li class="active"><a href="#/dashboard">Getting Started</a></li>
							<li><a href="https://lafka.github.com/tm-api-docs/v1/">Docs</a></li>
					 </ul>
					 <ul class="nav navbar-nav navbar-right">
							<li v-if="$root.$.auth.authenticated"><a href="#/user/logout">Logout</a></li>
							<!--
							<li><a href="#login">Login</a></li>
							<li><a href="#register">Sign Up</a></li>
							<li><a href="http://tiny-mesh.com">tiny-mesh.com</a></li>
							-->
					 </ul>
				</nav>
		 </div>
	</nav>
</template>

<script lang="js">
</script>
