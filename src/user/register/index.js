require('!style!css!./style.css');
require('zxcvbn2');
var client = require('tinymesh-cloud-client/tinymesh-cloud-client');
    store = require('store');

Vue.component('wb-user-register', {
	template: require('!raw!./template.html'),
	replace: true,
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
			client.user.register({email: this.email, password: this.password1})
				.then(function(resp) {
					if (201 === resp.status) {
						v.$root.onAuth(resp.body.auth);
					} else if (403 === resp.status) {
						v.$set('errors.email', "Did you already registered? The email is already in use");
					}
				});
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
});
