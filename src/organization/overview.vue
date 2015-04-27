<style lang="css">
.organization .list-group-item > button.btn-sm {
	padding: 3px 7px;
}
.organization list-group-item > button.pull-right {
	margin-top: -3px;
	margin-right: -7px;
}
.organization .muted-label {
	color: #aaa;
	font-style: italic;
	font-size: 0.8em;
}

.organization .help-block .glyphicon { top: 3px; }
</style>

<template lang="html">
<div class="organization">
	<div class="row">
		<div class="container-fluid">
			<div class="page-header">
				<h3>Edit Organization</h3>
			</div>
		</div>

		<div class="col-xs-6 overview">
			<form role="form" class="form-horizontal">
				<div class="form-group">
					<label for="organization-name" class="col-xs-3 control-label">Name</label>
					<div class="col-xs-7">
						<input
									v-model="orgPatch.name | patcher organization.name"
									type="text"
									class="form-control"
									id="organization-name"
									name="organization-name"
									placeholder="Organization name"/>
					</div>
					<div class="col-xs-2">
						<button
							v-on="click: $parent.save(orgPatch, $event)"
							v-attr="disabled: organizationPromise && !organizationPromise.resolved"
							v-class="'btn-spinner': organizationPromise && !organizationPromise.resolved"
							class="btn btn-success">

							<span v-show="organizationPromise && !organizationPromise.resolved" v-wb-spinner="organizationPromise"></span>

							<span v-if="organizationPromise && !organizationPromise.resolved">Saving changes</span>
							<span v-if="!organizationPromise || organizationPromise.resolved">Save changes</span>
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
	<div class="row">
		<div class="container-fluid">
			<div class="col-md-6">
				<div class="page-header">
					<h5>Users</h4>
				</div>
				<ul class="list-group">
					<li
							class="list-group-item"
							v-class="permitted: user.permitted, synced: user.synced"
							v-repeat="user: access.users">
							<a href="#">{{user.name}}</a>
							<span v-show="!user.synced" class="muted-label">Sync required</span>

							<button
								v-on="click: grant(user)"
								v-show="!user.permitted"
								class="pull-right btn btn-sm btn-success">Grant Access</button>
							<button
								v-on="click: revoke(user)"
								v-show="user.permitted"
								class="pull-right btn btn-sm btn-danger">Revoke Access</button>
					</li>
					<li class="list-group-item" v-class="has-error: !!newUserError">
						<form
							class="form-inline"
							v-on="submit: addUser(newUser)">

							<div class="row">
								<div class="form-group col-xs-3">
									<label for="addUserPerms" style="margin-top: 6px;">User Email</label>
								</div>
								<div class="form-group col-xs-6" v-class="has-error: !!newUserError">
									<input
										v-model="newUser"
										style="width: 100%;"
										class="form-control"
										id="addUserPerms" type="text"
										placeholder="User email" />
										<p v-show="newUserError" class="help-block">
											&nbsp;
											<span class="glyphicon glyphicon-remove"></span>&nbsp;
											<span>{{newUserError}}</span>
										</p>
								</div>
								<div class="form-group col-xs-2">
									<button
										v-on="click: addUser(newUser)"
										type="submit"
										class="btn btn-primary">Add User</button>
								</div>
							</div>
						</form>
					</li>
				</ul>
				<div class="action">
						<hr />
						<div class="pull-right">
								<button
										v-on="click: orgPatch.users = undefined"
										type="button"
										class="btn btn-default">
									Reset
								</button>
								<button
										v-on="click: $parent.save(orgPatch, $event)"
										v-attr="disabled: organizationPromise && !organizationPromise.resolved"
										v-class="'btn-spinner': organizationPromise && !organizationPromise.resolved"
										class="btn btn-primary">

									<span v-show="organizationPromise && !organizationPromise.resolved" v-wb-spinner="organizationPromise"></span>

									<span v-if="organizationPromise && !organizationPromise.resolved">Updating</span>
									<span v-if="!organizationPromise || organizationPromise.resolved">Update permissions</span>
								</button>
						</div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="page-header">
					<h5>Networks</h4>
				</div>
				<div class="content select-list">
					<ul>
						<li v-repeat="network: organization.networks">
							<a href="#/dashboard/{{network}}">{{network}}</a>
						</li>
						<li v-repeat="n: [1,2,3,4,5].slice(0, Math.max(5 - (organization.networks || []).length, 0))">
							<span class="dummy-block">&nbsp;</span>
						</li>
						<li>
							<form
								class="form-inline"
								v-on="submit: addNetwork(newNetwork, $event)">

								<div class="row">
									<div class="form-group col-xs-4">
										<label for="addNetwork" style="margin-top: 6px;">Network Name</label>
									</div>
									<div class="form-group col-xs-5" v-class="has-error: !!newNetError">
										<input
											v-model="newNetwork"
											style="width: 100%;"
											class="form-control"
											id="addnetwork" type="text"
											placeholder="Network Name" />
											<p v-show="newNetError" class="help-block">
												&nbsp;
												<span class="glyphicon glyphicon-remove"></span>&nbsp;
												<span>{{newNetError}}</span>
											</p>
									</div>
									<div class="form-group col-xs-2">
										<button
											v-on="click: addNetwork(newNetwork, $event)"
											type="submit"
											class="btn btn-primary">Add Network</button>
									</div>
								</div>
							</form>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

module.exports = {
	data: function() {
		return {
			orgPatch: {users: undefined},
			newUserError: undefined,

			newNetwork: "",
			newNetError: undefined,
			networkPromise: undefined,
		}
	},

	methods: {
		grant: function(ent) {
			if (!this.orgPatch.users)
				this.orgPatch.users = _.clone(this.organization.users)

			if (_.contains(this.orgPatch.users, ent.key))
				return

			this.orgPatch.users.push(ent.key)
			this.orgPatch.users = this.orgPatch.users

			this.$parent.$.notify.clear()
		},

		revoke: function(ent) {
			if (!this.orgPatch.users)
				this.orgPatch.users = _.clone(this.organization.users)

			var newusers = _.without(this.orgPatch.users, ent.key)

			if (newusers.length > 0) {
				this.orgPatch.users = newusers
				this.$parent.$.notify.clear()
			} else {
				this.$parent.$.notify.set('You are trying to remove the last user of an organization. At least one user must be present', 'warning')
			}
		},

		addUser: function(email) {
			if (!email)
				return

			if (!email.match(/[a-z0-9_.-]+@[a-z0-9_.-]+/))
				this.newUserError = "invalid email address"
			else {
				this.newUserError = undefined
				this.grant({
					key: email,
					name: email,
					synced: false,
					permitted: true
				})
			}
		},

		addNetwork: function(name, ev) {
			ev.preventDefault()

			if (!name || name.length === 0) {
				this.newNetError = "Invalid name"
				return
			}

			this.newNetError = undefined

			var network = {
				name: name,
				parents: ["organization/" + this.organization.key]
			}

			this.networkPromise = client.network.create({auth: this.$root.$.auth.data}, network).$promise
			this.networkPromise.then(function(network) {
				this.$parent.$.notify.set('Created new network', 'success')
				this.networkPromise = undefined

				if (undefined !== this.$parent.organization.networks) {
					this.$parent.organization.networks.push(network.key)
					this.$parent.organization.networks = this.$parent.organization.networks
				}

				client.organization.get({auth: this.$root.$.auth.data}, {key: this.organization.key})
					.$promise.then(function(org) {
						this.$parent.organization = org
				}.bind(this));
			}.bind(this), function(err) {
				var msg = err.text || err.message;
				this.$parent.$.notify.set('Failed to create network: ' + msg, 'danger')
				this.networkPromise = undefined
			}.bind(this));
		}
	},

	computed: {
		organization: function() {
			return this.$parent.organization
		},

		organizationPromise: function() {
			return this.$parent.organizationPromise
		},

		access: function() {
			if (!this.organization.users)
				return {users: []}

			var
				users = {},
				state = this.orgPatch.users || this.organization.users

			_.each(_.merge([], this.orgPatch.users || [], this.organization.users), function(user) {
				var
					permitted = _.contains(state, user),
					synced    = _.contains(state, user) === _.contains(this.organization.users, user)

				users[user] = {
					key: user,
					name: user,
					permitted: permitted,
					synced: synced
				}
			}.bind(this))

			return {
				users: _.toArray(users).sort(function(a,b) { return a.key > b.key; })
			}
		}
	}
}
</script>
