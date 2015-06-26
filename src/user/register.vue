<template lang="html">
	<form
		v-on="submit: register"
		id="signupform"
		class="form-horizontal"
		role="form">
		<div class="page-header">
			<h3>Create new user</h3>
		</div>

		<div style="margin-bottom: 20px"
			v-class="has-error: errors.email || (email && !emailValid)">
			<div class="input-group">
				<span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
				<input
					v-model="email"
					v-on="change: (errors || {}).email = undefined;"
					lazy
					type="text"
					id="login-username"
					name="username"
					class="form-control"
					placeholder="Email" />
			</div>
			<div
					v-if="errors.email"
					class="help-block text-right">
				<b>* {{errors.email}}</b>
			</div>
		</div>

		<div v-class="has-error: errors.password1 || !passwordMatch" style="margin-bottom: 20px;">
			<div class="input-group">
				<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
				<input
					v-model="password1"
					v-on="
						focus: showPwHelptext = true,
						blur: showPwHelptext = false,
						change: (errors || {}).password1 = (errors || {}).password2 = undefined
					"
					id="login-password"
					name="password"
					type="password"
					class="form-control"
					placeholder="Password">
			</div>
			<div v-if="passwordStrength >= 0" class="password-strength strength-{{passwordStrength}}" style="margin-left: 40px;">
				<span class="bar-1"></span><span class="bar-2"></span><span class="bar-3"></span><span class="bar-4"></span>
			</div>
			<div
					v-if="false !== showPwHelptext && passwordStrength >= 0"
					class="help-block password-strength-text strength-{{passwordStrength}}"
					style="margin-bottom: 0px; margin-left: 40px;">
				<span v-if="passwordStrength === 0">Terrible ...</span>
				<span v-if="passwordStrength === 1">Very weak</span>
				<span v-if="passwordStrength === 2">Not great</span>
				<span v-if="passwordStrength === 3">Good</span>
				<span v-if="passwordStrength === 4">Perfect!</span>
			</div>
			<div
					v-if="errors.password1"
					class="help-block text-right">
				<b>* {{errors.password1}}</b>
			</div>
		</div>

		<div v-class="has-error: errors.password2 || !passwordMatch" style="margin-bottom: 25px">
			<div class="input-group">
				<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
				<input v-model="password2"
					id="login-password"
					type="password"
					class="form-control"
					name="cofirmpassword"
					placeholder="Confirm Password">
			</div>
			<span class="help-block" v-if="!passwordMatch">
				The passwords entered did not match.
			</span>
			<div
					v-if="errors.password2"
					class="help-block text-right">
				<b>* {{errors.password2}}</b>
			</div>
		</div>

		<div style="margin-top:10px" class="form-group">
			<div class="col-sm-12 controls">
				<button class="btn btn-success">
					Sign up!
				</button>
			</div>
		</div>
	</form>
</template>

<script lang="js">
require('zxcvbn2');
var
	client = require('tinymesh-cloud-client');
	store = require('store');

module.exports = {
	data: function () {
		return {
			email: "",
			password1: "",
			password2: "",
			showPwHelptext: false,
			errors: {},
			flash: ""
		}
	},
	methods: {
		register: function(e) {
			e.preventDefault();

			this.flash = {};
			if (!this.email)
				this.$set('errors.email', "Missing email");
			else if (!this.emailValid)
				this.$set('errors.email', "Did you miss-spell? This seems like a invalid email");
			else
				delete this.errors.email;

			if ((!this.password1 && !this.password2) || !this.password1) {
				this.$set('errors.password1', "Specify a password to keep stalkers away");
			this.$set('errors.password2', "Confirm the password above");
			} else {
				delete this.errors.password1;
				delete this.errors.password2;
			}

			if (Object.keys(this.errors).length > 0 ) {
				return;
			}

			var v = this;
			var p = client.user.register({}, {email: this.email, password: this.password1})
				.then(function(resp) {
					if (201 === resp.status) {
						v.$root.onAuth(resp.body.auth);
					} else if (403 === resp.status) {
						v.$set('errors.email', "Did you already registered? The email is already in use");
					}
				});

			this.$root.$.loader.await(p.$promise)
		}
	},
	computed: {
		passwordStrength: function() {
			if (this.password1.length === 0)
				return -1;

			if (this.password1.length < 8)
				return 0;

			var strength = zxcvbn(this.password1, [this.email, 'tm', 'tiny', 'mesh', 'cloud']);
			return strength.score;
		},
		passwordMatch: function() {
			return this.submitted || (this.password1 && this.password2) ? this.password1 === this.password2 : true;
		},
		emailValid: function() {
			return null !== this.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/)
		}
	}
}
</script>
