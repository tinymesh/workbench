<style lang="css">
	.landing {
		color: white;
		position: relative; }

	.landing .landing-screen {
		padding: 125px 0;
	}


	.landing .landing-copy {
		margin-top: 100px;
		color: #d4e6f1;
		text-align: center;
	}
		.landing .landing-copy .lead {
			font-size: 2em;
		}

	/**
	.landing .landing-screen { background-color: #2980b9; padding: 125px 0px 33px 0px; }
	.landing .landing-container { position: relative; width: 770px; margin: 0 auto 90px; }
	.landing h1 { font-weight: bold; font-size: 4.5em; }
	.landing a { font-weight: bold; color: #fff; text-decoration: underline; cursor: pointer; }
	**/

	.box {
		background: #fff;
		border-radius: 2px;
		box-shadow: 0 6px 6px rgba(0,0,0,0.3);
		color: #aaa;
	}

	.landing .page-header {
		display: none;
	}

	.landing .box > .box-title {
		margin-bottom: 4rem;
	}

	.landing .box > .inline-info {
		margin-top: 4rem;
	}
</style>
<template lang="html">
<div class="landing">
	<div class="landing-screen">
		<div class="container-fluid">
			<div class="row">
					<div class="landing-copy col-sm-4 col-sm-offset-2">
						<p class="lead">Sense, monitor, and Control <b>any device</b></p>
						<p class="body">
							Sense inputs, monitor alerts, or control outputs
							with your <b>Tinymesh™</b> from anywhere in the world!
						</p>
						<p>
							<a class="btn btn-success" v-on="click: action = 'register'">Sign up</a>
							<a class="btn btn-default" href="https://tiny-mesh.com">Learn more at tiny-mesh.com</a>
						</p>
					</div>

					<div class="col-sm-3">
						<div class="box row" v-show="action == 'login'">
							<div class="box-title">
									<h4>Login</h4>
							</div>
							<div class="col-xs-12" id="login" v-component="user-login"></div>
							<div class="col-xs-12">
								<br />
								<a v-on="click: action = 'register'">Don't have a account? Sign up!</a>
							</div>
							<div class="col-xs-12 inline-info">
								You are using a beta product, it may not work as
								expected at all times but by giving us feedback we
								improve it over time!<br/ ><br />

								<em>By logging in to the <b>Tinymesh Cloud™</b> you agree to
								our terms of service.</em>
							</div>
						</div>
						<div class="box row" v-show="action == 'register'">
							<div class="box-title">
									<h4>Register</h4>
							</div>
							<div class="col-xs-12" id="login" v-component="user-register"></div>
							<div class="col-xs-12">
								<br />
								<a v-on="click: action = 'login'">Already have a account? Sign in here</a>
							</div>
							<div class="col-xs-12 inline-info">
								You are using a beta product, it may not work as
								expected at all times but by giving us feedback we
								improve it over time!<br/ ><br />

								<em>By signing up to the <b>Tinymesh Cloud™</b> you agree to
								our terms of service.</em>
							</div>
						</div>
					</div>

			</div>
			<div class="row">
			</div>
		</div>
	</div>
</div>
</template>

<script lang="js">

module.exports = {
	data: function() {
		return {
			action: 'login',
		}
	},

	attached: function() {
		this.$root.toggleBodyClass({'no-nav': true, 'panorama': true})
	},

	detached: function() {
		this.$root.toggleBodyClass({'no-nav': false, 'panorama': false})
	},

	components: {
		'user-login': require('./user/login.vue'),
		'user-register': require('./user/register.vue'),
	},

	events: {
		'user:auth': function(user) {
			app.$set('view', 'dashboard')
		}
	},

	computed: {
		component: function() {
			var component = 'user-' + this.action

			if (this.$options.components[component])
				return component
			else
				return null
			end

		}
	}
}
</script>
