require('insert-css')(require('./style.css'))
require('zxcvbn2');

module.exports = {
	template: require('./template.html'),
	replace: true,
	data: function () {
		return {
			email: "",
			password1: "",
			password2: "",
			showPwHelptext: false
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
			return (this.password1 && this.password2) ? this.password1 === this.password2 : true;
		},
		emailValid: function() {
			return null !== this.email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/)
		}
	}
}
