<style lang="css">
</style>

<template lang="html">
<div>
		<div v-component="wb-notify" v-ref="notify" id="notify"></div>

		<div class="container-fluid">
			<div class="col-xs-3">
				<div class="network-selector">
					<div class="page-header">
						<h6>Organizations</h6>
					</div>
					<div class="select-list" id="organization-list">
						<ul>
							<li
								v-class="active: params.organization === org"
								v-repeat="org: user.organizations">
								<a href="#/organization/{{org}}">{{org}}</a>
							</li>
							<li v-repeat="n: [1,2,3,4,5].slice(0, Math.max(5 - (user.organizations || []).length, 0))">
								<span class="dummy-block">&nbsp;</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="col-xs-9">
				<div v-if="!notFound && organization" v-component="organization-{{params.tab}}"></div>
				<div v-if="!notFound && !params.organization" v-component="organization-landing"></div>
				<div v-if="notFound" v-component="organization-404"></div>
			</div>
		</div>
</div>
</template>


<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	_ = require('lodash'),
	Vue = require('vue'),
	Finch = (require('./vendor/finch')).Finch,
	store = require('store')

var route = function(args) {
	app.$set('view', 'organization');
	app.$.data.$set('params.organization', args.org)
	app.$.data.$set('params.tab', args.tab || "overview")
}

module.exports = {
	data: function() {
		return {
			organization: undefined,
			organizationPromise: undefined,
			newOrg: ""
		}
	},

	init: function(navigation) {
		Finch.route('/organization', route)
		Finch.route('/organization/:org', route)
		Finch.route('/organization/:org/:tab', route)

		navigation.methods.add.call(navigation.proxy(), {
			text: 'Organizations',
			href: '/organization',
			auth: true,
			active: [/^\/$/, /^\/organization(\/|$)/],
			icon: 'glyphicon glyphicon-home',
		})

		return this;
	},

	route: route,

	components: {
		'organization-landing': require('./organization/landing.vue'),
		'organization-404': require('./organization/404.vue'),
		'organization-overview': require('./organization/overview.vue')
	},

	attached: function() {
		if (this.params.organization) {
			this.organization = client.organization.get({auth: this.$root.$.auth.data}, {key: this.params.organization})
			this.organizationPromise = this.organization.$promise
			this.organizationPromise.catch(function(err) {
				if (403 === err.status) {
					this.$set('organization', undefined)
				}
			}.bind(this))

			this.$root.$.loader.await(this.organizationPromise)
		}


		this.$root.$.data.$watch('params.organization', function(key) {
			var p = client.organization.get({auth: this.$root.$.auth.data}, {key: key}).$promise

			p.then(function(org) {
				this.$set('organization', org)
			}.bind(this), function(err) {
				if (403 === err.status) {
					this.$set('organization', undefined)
				}
			}.bind(this))

			this.organizationPromise = p
			this.$root.$.loader.await(p)
		}.bind(this))
	},

	methods: {
		create: function(org, ev) {
			ev.preventDefault()

			this.organizationPromise = client.organization.create({auth: this.$root.$.auth.data}, org).$promise
			this.organizationPromise.then(function(organization) {
				this.$.notify.set('Organization was created', 'success')
				this.organization = org
				this.organizationPromise = undefined
			}.bind(this), function(err) {
				this.$.notify.set('Failed to create organization: ' + msg, 'danger')
				this.organizationPromise = undefined
			})
		},

		save: function(orgPatch, e) {
			e.preventDefault();

			var qopts = { key: this.params.organization };

			// this.device.$promise not available, use returned promise
			var promise = this.organization.$update(
				{auth: this.$root.$.auth.data}, orgPatch, qopts).$promise

			this.organizationPromise = promise
			this.organizationPromise.then(function(organization) {
				this.$.notify.set('Organization was successfully updated', 'success')

				this.$set('organization', organization);
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$.notify.set('Failed to update organization: ' + msg, 'danger')
			}.bind(this));
		}
	},

	computed: {
		params: function() {
			return this.$root.$.data.params
		},

		user: function() {
			return this.$root.$.data.user
		},

		tabFound: function() {
			return undefined !== this.$options.components['organization-' + (this.params.tab || 'landing')]
		},

		notFound: function() {
			return !this.tabFound || undefined === this.organization
		}
	}
}
