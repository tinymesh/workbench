var
	store = require('store'),
	client = require('tinymesh-cloud-client');

module.exports = {
	name: 'auth',

	data: function() {
		return {
			data: client.auth.login({future: true}),
			authenticated: false
		};
	},

	ready: function() {
		client.$config.set('onUnauthorized', function() {
			this.$set('authenticated', false)
		}.bind(this))
	},

	methods: {
		onAuth: function(auth, onUser, onUserErr) {
			delete auth.$promise; // not serializable

			store.set('prevAuth?', true);
			store.set('auth', auth);


			this.$set('data', auth);
			this.$set('authenticated', true);

			console.log('fulfil')
			this.$root.$.data.networks.$fulfil({auth: auth});
			this.$root.$.loader.await(this.$root.$.data.networks.$promise)

			this.$root.$.data.networks.$promise.catch(function(res) {
				this.$root.$.notify.set('Failed to load networks. Try refreshing the page', 'danger')
			});

			this.$root.$.data.user = client.user.get({auth: auth});
			this.$root.$.data.user.$promise.then(function(user) {

			if (window.location.hash.match(/^#!\/?$/) ||
			    window.location.hash.match(/^#!\/user\/login/) ||
			    window.location.hash.match(/^#!\/user\/logout/)) {
				console.log('auth: force redirect' + window.location.hash + ' -> /dashboard')
				routego(window.location.hash || '#!/dashboard')
			} else {
				console.log('auth: force reload of: ' + window.location.hash)
				routego(window.location.hash || '#!/')
			}


				this.$root.$broadcast('user:auth', user)
				onUser && onUser(user)
			}.bind(this), onUserErr);
			this.$root.$.loader.await(this.$root.$.data.user.$promise)

			// hack to avoid 'pre-initialize' warning
			setauth = function(val) {
				console.log('setting authenticated', val)
				this.$set('authenticated', val);
			}.bind(this)

			ttl = parseInt(this.data.ttl) * 1000
			if (new Date(ttl).getTime() < new Date().getTime()) {
				alert("Server time is greater than you localtime, check your settings.")
			}
			setTimeout(function() {
				setauth(false)
			}, (ttl - new Date().getTime()))
		}
	}
}
