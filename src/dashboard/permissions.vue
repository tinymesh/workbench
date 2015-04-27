<style lang="css">
.network-permissions .list-group-item > button.btn-sm {
	padding: 3px 7px;
}
.network-permissions .list-group-item > button.pull-right {
	margin-top: -3px;
	margin-right: -7px;
}
.network-permissions .muted-label {
	color: #aaa;
	font-style: italic;
	font-size: 0.8em;
}

.network-permissions .help-block .glyphicon { top: 3px; }
.network-permissions .list-group-item.has-error {
	padding-bottom: 35px;
}

.network-permissions .sliced:nth-last-child(3) > * {
	opacity: 0.7;
}
.network-permissions .sliced:nth-last-child(2) > * {
	opacity: 0.4;
}
</style>

<template lang="html">
	<div class="row network-permissions">
		<div class="page-header">
			<h3>{{network.name || "Unnamed network — " + network.key}}</h3>
		</div>
		<div class="col-xs-6 overview">
			<div>
				<div class="page-header">
					<h4>Organizations Permissions</h4>
				</div>
				<ul class="list-group">
					<li
						class="list-group-item"
						v-class="permitted: org.permitted, synced: org.synced, sliced: !fullOrgList"
						v-repeat="org: access.organizations | viewMore 4 fullOrgList">
							<a href="#/organization/{{org.key}}">{{org.name}}</a>
							<span v-show="!org.synced" class="muted-label">Sync required</span>

							<button
								v-on="click: grant('organization', org)"
								v-show="!org.permitted"
								class="pull-right btn btn-sm btn-success">Grant Access</button>
							<button
								v-on="click: revoke('organization', org)"
								v-show="org.permitted"
								class="pull-right btn btn-sm btn-danger">Revoke Access</button>
					</li>
					<li
						class="list-group-item text-right">
						<a v-show="fullOrgList" v-on="click: fullOrgList = !fullOrgList">
							<span class="glyphicon glyphicon-chevron-up"></span> Show less
						</a>
						<a v-show="!fullOrgList" v-on="click: fullOrgList = !fullOrgList">
							<span class="glyphicon glyphicon-chevron-down"></span> Show all
						</a>
					</li>
				</ul>
			</div>

			<hr>

			<div>
				<div class="page-header">
					<h4>User Permissions</h4>
				</div>
				<ul class="list-group">
					<li
							class="list-group-item"
							v-class="permitted: user.permitted, synced: user.synced"
							v-repeat="user: access.users">
							<a href="#">{{user.name}}</a>
							<span v-show="!user.synced" class="muted-label">Sync required</span>

							<button
								v-on="click: grant('user', user)"
								v-show="!user.permitted"
								class="pull-right btn btn-sm btn-success">Grant Access</button>
							<button
								v-on="click: revoke('user', user)"
								v-show="user.permitted"
								class="pull-right btn btn-sm btn-danger">Revoke Access</button>
					</li>
					<li class="list-group-item" v-class="has-error: !!newUserError">
						<form
							class="form-inline"
							v-on="submit: addUser(newUser)">

							<div class="row">
								<div class="form-group col-xs-3">
									<label for="addUserPerms" style="margin-top: 6px;">Add User</label>
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
										v-on="click: networkPatch.parents = null"
										type="button"
										class="btn btn-default">
									Reset
								</button>
								<button
										v-on="click: $parent.save(networkPatch, $event)"
										type="button"
										class="btn btn-primary">
									Save
								</button>
						</div>
				</div>
			</div>
		</div>

		<div class="col-xs-4 channels">
			<p>
				Access to network data is restricted to a single user or
				organization. You can add and remove arbitrary users to the
				access list as long as there's at least one entity left in
				the access list.
			</p>
		</div>
	</div>
</template>

<script type="js">
module.exports = {
	data: function() {
		return {
			newUser: '',
			newUserError: '',
			networkPatch: {
				parents: undefined
			},
			fullOrgList: false
		}
	},

	methods: {
		grant: function(type, ent) {
			if (!this.networkPatch.parents)
				this.networkPatch.parents = _.clone(this.network.parents)

			if (_.contains(this.networkPatch.parents, type + '/' + ent.key))
				return

			this.networkPatch.parents.push(type + '/' + ent.key)
			this.networkPatch.parents = this.networkPatch.parents
		},

		revoke: function(type, ent) {
			if (!this.networkPatch.parents)
				this.networkPatch.parents = _.clone(this.network.parents)

			this.networkPatch.parents = _.without(
				this.networkPatch.parents,
				type + '/' + ent.key)
		},

		addUser: function(email) {
			if (!email.match(/[a-z0-9_.-]+@[a-z0-9_.-]+/))
				this.newUserError = "invalid email address"
			else {
				this.newUserError = undefined
				this.grant('user', {
					key: email,
					name: email,
					synced: false,
					permitted: true
				})
			}
		},
	},

	computed: {
		params: function() {
			return this.$root.$.data.params
		},

		user: function() {
			return this.$root.$.data.user
		},

		network: function() {
			return this.$root.$.data.network || {}
		},

		networkPromise: function() {
			return this.$parent.networkPromise
		},

		access: function() {
			var organizations = {}
			var users = {}

			_.each(this.networkPatch.parents || this.network.parents, function(entstr) {
				ent = entstr.split(/\//)

				var
					permitted = _.contains((this.networkPatch.parents || this.network.parents), entstr),
					synced    = _.contains(this.networkPatch.parents || this.network.parents, entstr) === _.contains(this.network.parents, entstr)

				switch (ent[0]) {
					case "organization":
						organizations[ent[1]] = {
							key: ent[1],
							name: ent[1],
							permitted: permitted,
							synced: synced
						}
						break;
					case "user":
						users[ent[1]] = {
							key: ent[1],
							name: ent[1],
							permitted: permitted,
							synced: synced
						}
						break;
				}
			}.bind(this))

			// add organizations from user
			_.each(this.user.organizations, function(org) {
				var
					entstr = 'organization/' + org,
					permitted = _.contains((this.networkPatch.parents || this.network.parents), entstr),
					synced    = _.contains(this.networkPatch.parents || this.network.parents, entstr) === _.contains(this.network.parents, entstr)

				if (!organizations[org])
					organizations[org] = {
						key: org,
						name: org,
						permitted: permitted,
						synced: synced
					}
			}.bind(this))

			// don't remove existing users, just show them as 'unsynced'
			_.each(this.network.parents, function(entstr) {
				ent = entstr.split(/\//)
				if ('user' === ent[0] && !users[ent[1]])
					users[ent[1]] = {
							key: ent[1],
							name: ent[1],
							permitted: false,
							synced: false
					}
			});

			return {
				users: _.toArray(users).sort(function(a,b) { return a.key > b.key; }),
				organizations: _.toArray(organizations).sort(function(a,b) { return a.key > b.key; }),
			}
		}
	}
}
</script>
