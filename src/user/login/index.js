require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client');

module.exports = {
  template: require('./template.html'),
  replace: true,
  data: function () {
    return {
			email: "",
			password: "",
			errors: {},
			errFlash: ""
		}
	},
	methods: {
		login: function(e) {
			e.preventDefault();

			if (!this.email)
				this.$set('errors.email', "Missing email");
			else if (!this.emailValid)
				this.$set('errors.email', "Did you miss-spell? This seems like a invalid email");
			else
				delete this.errors.email;

			if (!this.password)
				this.$set('errors.password', "You need to provide your password")
			else
				delete this.errors.password;

			if (Object.keys(this.errors).length > 0 ) {
				return;
			}

			var v = this;
			this.$root.auth = client.auth.login(this.email, this.password);
			this.$root.auth.$promise
				.then(function(body) {
					v.$root.router.setRoute('/dashboard');
					delete v.$root.errFlash;
					v.$root.onAuth(body);
					v.$root.flash = undefined;
					v.$root.user = client.user.get({auth: body});
				},
				function(err) {
					if (err.statusType && err.status === 401) {
						this.errFlash = "It seems like you entered some incorrect data, try again";
					} else {
						this.errFlash = "Ops, something went wrong. We are trying to figure it out, please try again later";
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
