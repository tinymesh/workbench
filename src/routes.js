module.exports = {
	'/': {
		component: require('./landingpage.vue'),
		before: function(to, from, allow, deny) {
			// check authentication, deny if authenticated
			allow()
		}
	},

	'/user/login': {
		component: require('./user/login.vue')
	},

	'/user/logout': {
		component: require('./user/logout.vue')
	},

	'/user/register': {
		component: require('./user/register.vue')
	},


	'/dashboard': {
		component: require('./dashboard.vue'),

		after: function(to, from) { to.tab = 'dashboard'; },

		navigation: {
			'/dashboard':  {
				text: "Dashboard",
				icon: 'glyphicon glyphicon-dashboard',
				show: function(app) {
					return app.$.auth.authenticated
				},
				active: [/^!?\//, /^!?\/dashboard(?:\/.*)?/],
				appendClasses: ['has-subbar']
			}
		},

		subRoutes: {
      	'/':                     { component: 'dashboard-landing' },
      	'/:network':             { component: 'dashboard-overview' },
      	'/:network/overview':    { component: 'dashboard-overview' },
      	'/:network/devices':     { component: 'dashboard-devices' },
      	'/:network/query':       { component: 'dashboard-query' },
      	'/:network/setup':       { component: 'dashboard-setup-guide' },
      	'/:network/permissions': {
				component: 'dashboard-overview',
				after: function(to, from) {
					to.params.section = 'acl'
				}
			},
		}
	},

	'/device/:network/:device': {
		component: 'device',
		subRoutes: {
			'/': { component: 'device-overview', },
			'/overview': { component: 'device-overview' },
			'/config': { component: 'device-config' },
			'/query': { component: 'device-query' },
		}
	},

	'*': {
		component: require('./error/404.vue'),
		alwaysRefresh: true,
		after: function(to, from) {
			console.log('not-found: ' + to.path + ' (from: ' +  (from && from.path) + ')')
		}
	},
}
