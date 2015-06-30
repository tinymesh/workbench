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
			console.log('auth: authorization invalidated')
			this.$set('authenticated', false)
			this.route._router.go('/user/logout?reason=unauthorized')
		}.bind(this))
	},

	methods: {
		onAuth: function(auth, onUser, onUserErr) {
			delete auth.$promise; // not serializable
			var router = this.route._router

			// add redirect
			router.redirect({'/': '/dashboard'})

			store.set('prevAuth?', true);
			store.set('auth', auth);


			this.$set('data', auth);
			this.$set('authenticated', true);

			this.$root.$.data.networks.$fulfil({auth: auth});
			this.$root.$.loader.await(this.$root.$.data.networks.$promise)

			this.$root.$.data.networks.$promise.catch(function(res) {
				this.$root.$.notify.set('Failed to load networks. Try refreshing the page', 'danger')
			});

			this.$root.$.data.user = client.user.get({auth: auth});
			this.$root.$.data.user.$promise.then(function(user) {

			if (!window.location.hash ||
			    window.location.hash.match(/^#!?\/?$/) ||
			    window.location.hash.match(/^#!?\/user\/login/)) {
				console.log('auth: force redirect: ' + window.location.hash + ' -> #!/dashboard')
				router.go('#!/dashboard')
			} else {
				console.log('auth: force reload of: ' + (window.location.hash))
				router.go('#!' + (window.location.hash || '#!/').replace(/^#!?/, ''))
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

			//ttl = parseInt(this.data.ttl) * 1000
			//if (new Date(ttl).getTime() < new Date().getTime()) {
			//	alert("Server time is greater than you localtime, check your settings.")
			//}
			//setTimeout(function() {
			//	setauth(false)
			//}, (ttl - new Date().getTime()))
		}
	}
}
