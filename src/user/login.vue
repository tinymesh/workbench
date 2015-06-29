<template lang="html">

	<div class="page-header">
		<h3>Login</h3>
	</div>

	<div style="margin-bottom:2rem;" class="col-xs-12" v-component="wb-notify" v-ref="notify" id="notify"></div>
	<div class="col-xs-12">
	<form id="loginform" role="form" v-on="submit: login(email, password, $event)">
		<div class="form-group" v-class="has-error: errors.email,has-warning: errors.credential">
			<div class="input-group">
				<span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
				<input
					v-model="email"
					v-on="change: errors.email = undefined;"
					id="login-username"
					type="text"
					class="form-control"
					name="username"
					value=""
					placeholder="Username or Email">
			</div>
			<div
					v-if="errors.email"
					class="help-block text-right">
				<b>* {{errors.email}}</b>
			</div>
		</div>

		<div class="form-group" v-class="has-error: errors.password,has-warning: errors.credential">
			<div class="input-group">
				<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
				<input
					v-model="password"
					v-on="change: errors.password = undefined"
					id="login-password"
					type="password"
					class="form-control"
					name="Password"
					placeholder="Password">
			</div>
			<div
					v-if="errors.password"
					class="help-block text-right">
				<b>* {{errors.password}}</b>
			</div>
		</div>

		<div style="margin-top:10px" class="form-group">
			<div class="col-sm-12 controls">
				<button
					v-on="click: login(email, password, $event)"
					v-attr="disabled: loginPromise"
					v-class="'btn-spinner': loginPromise"
					class="btn btn-success">

					<span v-wb-spinner="loginPromise"></span>

					<span v-if="loginPromise">Authenticating</span>
					<span v-if="!loginPromise">Login</span>
				</button>
		</div>
	</form>
</template>

<script lang="js">
var client = require('tinymesh-cloud-client');

module.exports = {
	data: function () {
		return {
			email: "",
			password: "",
			errors: {
				credential: undefined,
				password: undefined,
				email: undefined,
			},
			loginPromise: undefined
		}
	},
	methods: {
		login: function(email, password, e) {
			e.preventDefault();

			this.errors.credential = undefined;

			if (!email)
				this.$set('errors.email', "Missing email");
			else if (!this.emailValid)
				this.$set('errors.email', "Did you miss-spell? This seems like a invalid email");
			else
				this.errors.email = undefined;

			if (!password)
				this.$set('errors.password', "You need to provide your password")
			else
				this.errors.password = undefined;

			if (_.filter(this.errors, function(v) { return v !== undefined; }).length > 0 )
				return

			var v = this;
			this.$root.$.auth.data = client.auth.login({}, {email: email, password: password});
			this.loginPromise = this.$root.$.auth.data.$promise;
			this.$root.$.loader.await(this.loginPromise)

			notify = this.$.notify || this.$parent.$.notify

			this.loginPromise
				.then(function(body) {
					v.$root.$.auth.onAuth(body);
					this.loginPromise = undefined;
					notify.clear();
				}.bind(this),
				function(err) {
					this.loginPromise = undefined;
					if (err.status === 401) {
						console.log('should be notified', this.$root.$);
						notify.set('It seems your details are incorrect, give it another go!');
						console.log('should be notified', err);
						this.$set('errors.credential', true);
					} else {
						this.$set('errors.credential', false);
						notify.set(
							'Ops, something went wrong. We are trying to figure it out, please try again later',
							'danger');
					}
				}.bind(this));
		}
	},
	computed: {
		emailValid: function() {
			return null !== this.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/)
		}
	}
}
</script>
