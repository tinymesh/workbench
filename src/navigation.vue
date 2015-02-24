<style lang="css">
.navbar {
	background: #f7f7f7;
	min-height: 1px !important;
	border-bottom: 1px solid #eee;
	margin-bottom: 0px;
	border-radius: 0px;
}
.navbar.has-subbar {
	border: none;
}

.navbar-nav > li > a {
	padding: 7px 15px;
}

.navbar .navbar-header a {
	padding: 15px 0 10px 15px;
	height: auto;
	font-weight: bold;
	height: 46px;
}

.navbar li a {
	line-height: 32px;
}

.navbar .main li a {
	font-weight: bold;
	padding-left: 30px;
	padding-right: 30px;
}

.has-subbar .navbar .main li.active a {
	color: #52bad5;
}
.navbar .main li.active a:focus {
	background: transparent;
}
.nav.main li.active {
	background: #f3f3f3;
}
	.nav.main li.active a {
		color: #337ab7;
		border-bottom: 3px solid #337ab7;
	}
	.nav.main li.active a:hover {
		border-bottom-color: #337ab7;
		background: #e7e7e7;
	}

.has-subbar .navbar .main li.active a {
	color: #52bad5;
	padding-top: 10px;
	padding-bottom: 4px;
}
.has-subbar .nav.main li.active {
	background: #343d46
}
	.has-subbar .nav.main li.active a {
		color: #fff;
		border-bottom-color: #343d46
	}
	.has-subbar .nav.main li.active a:hover {
		background: #454e57;
		border-bottom-color: #4a545b;
	}
</style>

<template lang="html">
	<nav
		class="navbar {{active ? (active.appendClasses || '') : ''}}"
		role="navigation">
		 <div class="container-fluid">
				<div class="navbar-header col-xs-2">
					 <a href="./index.html" class="navbar-brand">Workbench</a>
				</div>
				<nav class="col-xs-10" role="navigation">
					 <ul class="nav main navbar-nav">
							<li
								v-show="undefined === link.auth || link.auth === $root.$.auth.authenticated"
								v-class="active: setAndCheckActive(link)"
								v-repeat="link: links">
									<a href="#{{link.href}}">
										<span v-if="link.icon" v-attr="class: link.icon">&nbsp;</span>
										{{link.text}}
									</a>
							</li>
					 </ul>
					 <ul class="nav navbar-nav navbar-right">
							<li v-if="$root.$.auth.authenticated">
								<a href="#/user/logout">Logout</a>
							</li>
							<!--
							<li><a href="#login">Login</a></li>
							<li><a href="#register">Sign Up</a></li>
							<li><a href="http://tiny-mesh.com">tiny-mesh.com</a></li>
							-->
					 </ul>
				</nav>
		 </div>
	</nav>
</template>

<script lang="js">
var
    _ = require('lodash')

var
	links = []

module.exports = {
	init: function() {
		links.push({
				text: 'Login',
				href: '/',
				auth: false,
				active: ['/', '/dashboard', '/user/login', '/user/logout']
		})

		return this
	},

	ready: function() {
		window.addEventListener("hashchange", function(hash) {
			this.hash = hash.newURL.replace(/[^#]*#/, '')
		}.bind(this), false)
	},

	proxy: function() {
		return {links: links}
	},

	data: function() {
		return {
			links: links,
			active: undefined,
			hash: window.location.hash.replace(/^#/, '')
		}
	},

	events: {
		'user:auth': function(user) {
				return true
		},
	},

	methods: {
		setAndCheckActive: function(link) {
			if (undefined !== link.auth && link.auth !== this.$root.$.auth.authenticated)
				return false

			var res = _.any(link.active || [], function(match) {
				if (_.isRegExp(match))
					return this.hash.match(match)
				else
					return match === this.hash
			}.bind(this))

			if (res)
				this.active = link

			return res;
		},

		// adds a link, if a link with similar .href exists it will be
		// overwritten
		add: function(link) {
			if (!link.text)
				throw new Error("navigation.add must be called with object containing a .text property")
			if (!link.href)
				throw new Error("navigation.add must be called with object containing a .href property")
			if (!link.active)
				throw new Error("navigation.add must be called with object containing a .active property")

			var p
			if (p = _.findWhere(this.links, {href: link.href}))
				console.log('found', p)

			this.links.push(link)
		},

		remove: function() {
		},
	}
}
</script>
