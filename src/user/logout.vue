<style lang="css">
/*
 * 404 Not found
 */
.logout {
	color: white;
	position: relative; }

.logout .logout-screen { background-color: #2980b9; padding: 125px 0px 33px 0px; }
.logout .logout-container { position: relative; width: 770px; margin: 0 auto 90px; }
.logout h1 { font-weight: bold; font-size: 4.5em; }
.logout a { font-weight: bold; color: #fff; text-decoration: underline; cursor: pointer; }

.box {
	background: #fff;
	border-radius: 2px;
	box-shadow: 0 6px 6px rgba(0,0,0,0.3);
	color: #aaa;
}

#login .page-header {
	display: none;
}

/*
page-header {
￼  padding-bottom: 9px;
￼  margin: 40px 0 20px;
￼  border-bottom: 1px solid #eee;
*/
</style>

<template lang="html">
<div class="logout">
	<div class="logout-screen">
		<div class="logout-container">
			<div class="row">
					<div class="logout-icon col-xs-4">
						<img src="{{mailicon}}" alt="You are logged out!">
					</div>

					<div class="col-xs-8">
						<div class="box row" id="login">
							<div class="box-title">
									<h4>Login</h4>
							</div>
							<div class="col-xs-12" v-if="'unauthorized' == route.query.reason">
								<div class="alert alert-info">
									Your session has expired, please log in again.
								</div>
							</div>
							<div class="col-xs-12"  v-component="user-login"></div>
							<div class="col-xs-12 inline-info">
								You have been signed out of your session.
								Considering this is a beta product, feel free to give
								us some feedback on what we can improve!
							</div>
						</div>
					</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	img = null

module.exports = {
	attached: function() {
		this.$root.toggleBodyClass({'no-nav': true, 'panorama': true})
	},

	detached: function() {
		this.$root.toggleBodyClass({'no-nav': false, 'panorama': false})
	},

	created: function() {
		var logout = client.auth.logout({auth: this.$root.$.auth.data})

		logout.$promise.then(function() {
			this.$root.$.auth.$set('data', {})
			this.$root.$.auth.$set('authenticated', false)

		}, function(res, err) {
			if (res.status === 205 || res.status === 401)  {
				this.$root.$.auth.$set('data', {})
				this.$root.$.auth.$set('authenticated', false)
				console.log("you are now logged out");
			} else {
				Finch.navigate('/');
				app.$.notify.set("We could not log you out at this point, please try again", "danger");
			}
		});

		this.$root.$.loader.await(logout.$promise)
	},

	computed: {
		mailicon: function() {
			return img
		},
	}
}
