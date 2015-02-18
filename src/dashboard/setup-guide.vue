<style lang="css">
.smpl-step {
	margin-top: 40px;
}
.no-margin .smpl-step {
	margin-top: inherit;
	}
.smpl-step {
	border-bottom: solid 1px #e0e0e0;
	padding: 0 0 10px 0;
}

.smpl-step > .smpl-step-step {
padding: 0;
position: relative;
}   

.smpl-step > .smpl-step-step .smpl-step-num {
	font-size: 17px;
	margin-top: -20px;
	margin-left: 47px;
}

.smpl-step > .smpl-step-step .smpl-step-info {
	font-size: 14px;
	padding-top: 27px;
	text-align: center;
	padding-left: 35px;
	color: #aaa;
}
.smpl-step > .smpl-step-step.complete .smpl-step-info {
	text-decoration: line-through;
}
.smpl-step > .smpl-step-step.active .smpl-step-info {
	color: #777;
	font-weight: bold;
	padding-top: 35px;
}

.smpl-step > .smpl-step-step > .smpl-step-icon {
	position: absolute;
	width: 70px;
	height: 70px;
	display: block;
	background: #5CB85C;
	top: 45px;
	left: 50%;
	margin-top: -35px;
	margin-left: -15px;
	border-radius: 50%;
}
	.smpl-step > .smpl-step-step.active > .smpl-step-icon {
		width: 80px;
		height: 80px;
	}
.smpl-step > .smpl-step-step > .smpl-step-icon > .glyphicon {
	font-size: 34px;
	text-align: center;
	width: 67px;
	padding: 16px 0;
	color: #9E9;
}
.smpl-step > .smpl-step-step.active > .smpl-step-icon > .glyphicon {
	color: #fff;
	width: 79px;
	padding-top: 21px;
}
.smpl-step > .smpl-step-step.disabled > .smpl-step-icon > .glyphicon {
	color: #aaa;
}

.smpl-step > .smpl-step-step > .progress {
position: relative;
	border-radius: 0px;
height: 8px;
	box-shadow: none;
	margin-top: 37px;
}

.smpl-step > .smpl-step-step > .progress > .progress-bar {
	width: 0px;
	box-shadow: none;
	background: #428BCA;
}

.smpl-step > .smpl-step-step.complete > .progress > .progress-bar {
	width: 100%;
}

.smpl-step > .smpl-step-step.active > .progress > .progress-bar {
	width: 50%;
}

.smpl-step > .smpl-step-step:first-child.active > .progress > .progress-bar {
	width: 0%;
}

.smpl-step > .smpl-step-step:last-child.active > .progress > .progress-bar {
	width: 100%;
}

.smpl-step > .smpl-step-step.disabled > .smpl-step-icon {
	background-color: #f5f5f5;
}

.smpl-step > .smpl-step-step.disabled > .smpl-step-icon:after {
	opacity: 0;
}

.smpl-step > .smpl-step-step:first-child > .progress {
	left: 50%;
	width: 50%;
}

.smpl-step > .smpl-step-step:last-child > .progress {
	width: 50%;
}

.smpl-step > .smpl-step-step.disabled a.smpl-step-icon {
	pointer-events: none;
}




#setup-guide .btn .hover {
	position: absolute;
	bottom: -18px;
	font-size: 12px;
	font-weight: normal;
	left: 0;
	text-align: center;
	width: 100%;
}

#setup-guide .btn-help {
	font-weight: bold;
	font-size:24px;
	line-height:12px;
	padding: 10px;
	color: #fff;
	position: relative;
	background: #ddd;
}
	#setup-guide .btn-help:hover, #setup-guide .btn-help:active, #setup-guide .btn-help.active {
		color: #333;
	}
	#setup-guide .btn-help:before {
		content: "?";
	}

#setup-guide {
	max-width: 1024px;
}
</style>

<template lang="html">
	<div id="setup-guide">
		<div class="row">
			<div class="smpl-step" style="border-bottom: none">
				<div class="col-xs-11 smpl-step" style="border-bottom: none">

					<div v-if="$root.$.data.initialSetup" class="col-xs-3 smpl-step-step complete">
						<div class="progress">
							<div class="progress-bar"></div>
						</div>
						<a class="smpl-step-icon"><i class="glyphicon glyphicon-user"></i></a>
						<div class="smpl-step-info text-center">Register Tinymesh user</div>
					</div>

					<div
						class="smpl-step-step"
						v-class="
							col-xs-3: $root.$.data.initialSetup,
							col-xs-4: !$root.$.data.initialSetup,
							active: !network,
							complete: network
						">
						<div class="progress">
							<div class="progress-bar"></div>
						</div>
						<a class="smpl-step-icon"><i class="glyphicon glyphicon-home"></i></a>
						<div v-if="$root.$.data.initialSetup" class="smpl-step-info text-center">Create your first network</div>
						<div v-if="!$root.$.data.initialSetup" class="smpl-step-info text-center">Create network</div>
					</div>
					<div class="col-xs-3 smpl-step-step"
						v-class="
							col-xs-3: $root.$.data.initialSetup,
							col-xs-4: !$root.$.data.initialSetup,
							active: network && !network.hasChannels(),
							disabled: !network,
							complete: network && network.hasChannels()
						">
						<div class="progress">
							<div class="progress-bar"></div>
						</div>
						<a class="smpl-step-icon"><i class="glyphicon glyphicon-th-large"></i></a>
						<div class="smpl-step-info text-center">Provision your device</div>
					</div>
					<div class="col-xs-3 smpl-step-step"
						v-class="
							col-xs-3: $root.$.data.initialSetup,
							col-xs-4: !$root.$.data.initialSetup,
							active: network && network.hasChannels() && !network.haveConnected(),
							disabled: !network || !network.hasChannels(),
							complete: network.hasChannels()
						">
						<div class="progress">
							<div class="progress-bar"></div>
						</div>
						<a class="smpl-step-icon"><i class="glyphicon glyphicon-cloud"></i></a>
						<div class="smpl-step-info text-center">Establish connection to device</div>
					</div>
				</div>
			</div>
		</div>

		<hr />

		<div class="row" v-if="undefined === network">
			<div class="col-xs-8">
				<p class="lead" v-if="$root.$.data.initialSetup">
					Hey {{$root.$.data.user.name || $root.$.data.user.email}}, I see you don't have a network yet. 
					To get you started quickly we started filling out some
					information for you, to finish just fill in the few remaining blanks!
				</p>

				<form name="network" role="form" v-on="submit: createNetwork($parent.networkPatch, $event)">
					<div class="form-group has-feedback" v-class="has-error: errors.name">
						<label for="name">Network Name</label>
						<input v-model="$parent.networkPatch.name" v-on="change: errors.name = null" type="text"
						class="form-control" id="name" placeholder="Enter Network Name">
						<span v-if="errors.name" class="glyphicon glyphicon-remove form-control-feedback"></span>
						<span v-if="errors.name" id="name" class="sr-only">(error)</span>
						<p v-if="errors.name" class="help-block text-right">
							* {{errors.name}}
						</p>
					</div>
					<button
						class="btn btn-success"
						type="submit"
						v-on="click: createNetwork($parent.networkPatch, $event)"
						v-attr="disabled: $parent.networkPromise"
						v-class="'btn-spinner': $parent.networkPromise">

						<span v-wb-spinner="$parent.networkPromise"></span>

						<span v-if="$parent.networkPromise">Creating Network</span>
						<span v-if="!$parent.networkPromise">Create Network</span>
					</button>
				</form>

				<br />
				<p class="mute">
					If you don't have Tinymesh gateway or any Tinymesh radio
					modules yet you should <a href="http://tiny-mesh.com/mesh-network/demokit.html">consider getting some</a> from.
				</p>
			</div>

			<div class="col-xs-4" v-if="$root.$.data.initialSetup">
				<p class="lead">
					What is a network?
				</p>
				<p>
					Networks separates different applications. You might have a
					network at home and a different one in the office. Each
					network consists of one or more gateway units that communicate
					with your Tinymesh network.
				</p>
			</div>
		</div>

		<div class="row" v-if="network && !network.hasChannels()">
			<div class="col-xs-8">
				<form
					name="channel"
					role="form"
					v-on="submit: createChannel(channel, $event)">

					<div class="form-group has-feedback" v-class="has-error: errors.name">
						<label for="name">Channel Name</label>
						<input v-model="channel.name" v-on="change: errors.name = undefined" type="text"
						class="form-control" id="name" placeholder="Channel name (ie 'GPRS Gateway' or 'USB stick')">
						<span v-if="errors.name" class="glyphicon glyphicon-remove form-control-feedback"></span>
						<span v-if="errors.name" id="name" class="sr-only">(error)</span>
						<p v-if="errors.name" class="help-block text-right">
							* {{errors.name}}
						</p>
					</div>

					<div class="form-group has-feedback" v-class="has-error: errors.address">
						<label for="name">Gateway UID</label>
						<input v-model="channel.address" v-on="change: errors.address = undefined" type="text" class="form-control"
						id="uid" placeholder="Channel UID" />
						<span v-if="errors.address" class="glyphicon glyphicon-remove form-control-feedback"></span>
						<span v-if="errors.address" id="name" class="sr-only">(error)</span>
						<p v-if="errors.address" class="help-block text-right">
							* {{errors.address}}
						</p>
						<p class="help-block">
							The address can either be specified as a single 32-bit integer (<code>19552</code>),
							a dotted decimal representation (
							<code>1.0.0.0</code>) or a colon separated hex address (
							<code>01:0:0:0</code>).
							<br />If you don't know the gateway UID, use <code>1</code>.
							<br />
							<i>Note: The addresses are encoded with little endian, information
							here has same representation as in the Tinymesh configuration memory</i>
						</p>
					</div>

					<button
						class="btn btn-success"
						type="submit"
						v-on="click: createChannel(channel, $event)"
						v-attr="disabled: channel.$promise"
						v-class="'btn-spinner': channel.$promise">

						<span v-wb-spinner="channel.$promise"></span>

						<span v-if="channel.$promise">Creating Channel</span>
						<span v-if="!channel.$promise">Create Channel</span>
					</button>

					<!--
					<button
						class="btn btn-primary"
						v-if="$root.isChrome"
						v-on="click: provisionWithChrome($event, network.key)"
						v-attr="disabled: channelPromise"
						v-class="'btn-spinner': channelPromise">

						<span v-wb-spinner="channelPromise"></span>

						<span v-if="channelPromise">Provisioning Channel</span>
						<span v-if="!channelPromise">Provision with Chrome</span>
					</button>
					-->

	<!--
					<a
						class="btn btn-mute btn-help pull-right"
						v-class="active: view.helpText"
						v-on="click: view.helpText = !view.helpText">

						<span class="hover">Help</span>
					</a>
	-->
				</form>

				<div class="helpText" v-if="false">
					<hr>

					<div>
						<h4>What does 'Provision with Chrome' do?</h4>
						<p>
							To make the first connection as simple as possible you can
							use our <a href="https://en.wikipedia.org/wiki/Google_Chrome_extensions">Chrome Extension</a>
							to do all the heavy lifting. This will automate all the configuration for the gateway
							and setup the connection from the gateway to the cloud service.
						</p>
					</div>

				</div>
			</div>

			<div class="col-xs-4" v-if="$root.$.data.initialSetup">
				<p class="lead">
					What are Channels and Network connectors?
				</p>
				<p>
					The device connecting your Tinymesh gateway to the cloud is
					called a Network Connector. It opens a connection that acts
					as a Data Channel (or just Channel for short). Once a Channel
					have been established the Tinymesh Gateway and the Cloud
					service can exchange data over the connection.
				</p>
			</div>
		</div>

		<div v-if="network && network.hasChannels() && !network.haveConnected()" class="row">
			<div class="col-xs-12">
				<h3>Your almost done, we only need some slight configuration</h3>

				<p class="lead">
					The last piece of the puzzle is configuring your gateway to connect to the Tiny
					Mesh Cloud
				</p>

				<div class="row">
					<div class="col-xs-4" style="position:relative;">
						<div class="page-header">
							<h3>Connection Method</h3>
						</div>

						<ul class="nav nav-stacked">
	<!--
							<li
								v-if="'chrome' == configureTab || $root.isChrome"
								v-class="active: 'chrome' == configureTab">
								<a v-on="click: configureTab = 'chrome'">Chrome Extension</a>
							</li>
	-->
							<li v-class="active: 'linux' == configureTab">
								<a v-on="click: configureTab = 'linux'">Linux</a>
							</li>
							<li v-class="active: 'win' == configureTab">
								<a v-on="click: configureTab = 'win'">Windows</a>
							</li>
							<li v-class="active: 'mac' == configureTab">
								<a v-on="click: configureTab = 'mac'">Mac OS X</a>
							</li>
						</ul>
					</div>
					<div class="col-xs-8">
						<div id="provision-with-chrome" v-if="configureTab === 'chrome'">
							<div class="page-header">
								<h3>Connect With Google Chrome</h3>
							</div>

							<div v-if="!$root.isChrome">
								<p class="lead">You are not using Chrome as your browser.</p>
								<p>
									To use this method of connection you need to use the
									chrome web browser.
								</p>
								<p>
									<a class="btn btn-primary" href="https://www.google.com/chrome/browser/desktop/">Download Chrome</a>
								</p>

								<hr />
							</div>

							<div
								v-if="!$root.hasChromeApp"
								id="install-tinyconnector-box">
								<div class="col-xs-12 page-header">
									<h4>Install Chrome extension</h4>
								</div>

								<p class="col-xs-8">
									Install the <a href="https://chrome.google.com/webstore/detail/gggiioljfnkabofaoknolicdlnjadcpn">Tinyconnector software</a>
									from Chrome Web Store.<br />
									The extensions accesses the Tinymesh Gateway device
									through it's serial port, configuring all the parameters
									and connecting to the cloud service.
								</p>
								<div class="col-xs-4">
									<button class="btn btn-info" v-on="click: installChromeApp($event)" id="tinyconnector-install-button">Add to Chrome</button>
								</div>
							</div>

							<div id="run-tinyconnector-box">
								<div class="col-xs-12 page-header">
									<h4>Run Tinyconnector</h4>
								</div>

								<p class="col-xs-8">
									You already have Tinyconnector installed; Great!<br />
									You just need to select the correct serial port and we
									will connect you!
								</p>
								<div class="col-xs-4">
									<button class="btn btn-info" v-on="click: provisionWithChrome($event, network.key, address)" id="tinyconnector-launch-button">Auto provision</button>
								</div>
							</div>
						</div>
					</div>
		<!--
					<h4>Configuring the device</h4>
					<p>
						The initial device configuration is done through the serial port of gateway device.

						<ul>
							<li>Connect your device</li>
							<li>Enter configuration mode by pressing the <code>Config</code> button (both
								LED's on the board should now light up permanently</li>
							<li>Through your favourite terminal emulator send the ASCII character <code>G</code> to
								enable gateway mode</li>
							<li>Enter configuration memory by sending the characters <code>HW</code>
							</li>
							<li>Send two hex bytes <code>0x03</code> and <code>0x00</code> to enable protocol
								mode
							</li>
							<li>
								Set the UID of the device by sending the hex bytes
								<code>0x2D</code>
								<code>0x{{chanuidbytes[3]}}</code>
								<code>0x2E</code>
								<code>0x{{chanuidbytes[2]}}</code>
								<code>0x2F</code>
								<code>0x{{chanuidbytes[1]}}</code>
								<code>0x30</code>
								<code>0x{{chanuidbytes[0]}}</code>
							</li>
							<li>Exit configuration memory by send hex byte <code>0xFF</code>
							</li>
							<li>Enter calibration memory by sending ASCII characters <code>HW</code>
							</li>
							<li>
								Set the UID of the device by sending the hex bytes
								<code>0x17</code>
								<code>0x{{nidbytes[0]}}</code>
								<code>0x18</code>
								<code>0x{{nidbytes[1]}}</code>
								<code>0x19</code>
								<code>0x{{nidbytes[2]}}</code>
								<code>0x1A</code>
								<code>0x{{nidbytes[3]}}</code>
							</li>
							<li>Exit calibration memory by send hex byte <code>0xFF</code>
							</li>
							<li>Exit configuration mode by send ASCII character <code>X</code>
							</li>
						</ul>
					</p>
		-->

					<div v-if="configureTab === 'win'" class="col-xs-8">
						<div class="page-header">
							<h3>Setup Network Connector software for Windows</h3>
						</div>

						<p>
							<ul>
								<li>Download and install <a href="https://cloud.tiny-mesh.com/tm-connect-webkit-0.1.0.exe">Tinymesh Connect</a>
								</li>
								<li>Run the <code>TM-Connect</code> executable found on your desktop</li>
								<li>Select the COM port used by the Tiny Mesh Gateway</li>
								<li>The software will automatically connect</li>
							</ul>
						</p>
					</div>

					<div v-if="configureTab === 'mac'" class="col-xs-8">
						<div class="page-header">
							<h3>Setup Network Connector software for Mac OS X</h3>
						</div>

						<p>
							<ul>
								<li>Install brew through <a href="http://brew.sh/">Homebrew</a>
								</li>
								<li>Install <code>python</code> with pip: <code>brew install python</code>
								</li>
								<li>Install python dependencies: <code>pip install pyserial Twisted zope.interface</code>
								</li>
								<li>Download <a href="https://raw.githubusercontent.com/tinymesh/guri/master/guri.py">guri.py</a>
								</li>
								<li>Run guri <code>python2 guri.py [TTY]	-vvvv /dev/ttyUSB0 31.169.50.34 </code>
								</li>
							</ul>
						</p>
					</div>

					<div v-if="configureTab === 'linux'" class="col-xs-8">
						<div class="page-header">
							<h3>Setup Network Connector software for Linux</h3>
						</div>

						<p>
							<ul>
								<li>Install <code>python</code> with pip through your package manager</li>
								<li>Install python dependencies: <code>pip install pyserial Twisted zope.interface</code>
								</li>
								<li>Download <a href="https://raw.githubusercontent.com/tinymesh/guri/master/guri.py">guri.py</a>
								</li>
								<li>Run guri <code>python2 guri.py /dev/ttyUSB0 -vvvv /dev/ttyUSB0 31.169.50.34 </code>
								</li>
							</ul>
						</p>
					</div>
				</div>
			</div>
		</div>
		<div v-if="network && network.haveConnected()" class="row">
			<div class="col-xs-12">
				<h3>All done!!!!</h3>

				<p class="lead">
					Congratulations, you're done setting up this network.
				</p>
			</div>
		</div>
	</div>
</template>

<script type="js">
var
	client = require('tinymesh-cloud-client')

module.exports = {
	compiled: function() {
		switch (this.$root.platform) {
			case "chrome":
			case "win":
			case "linux":
			case "mac":
				this.configureTab = this.$root.platform;
				break;
		}
	},

	data: function() {
		return {
			errors: { },
			channel: {
				name: '',
				address: '',
				type: 'gateway',
				$promise: undefined
			},
			configureTab: this.$root.platform
		}
	},

	methods: {
		createNetwork: function(data, ev) {
			ev.preventDefault()

			if (!data.name)
				this.$set('errors.name', "You need to name your network")
			else
				delete this.errors.name

			if (Object.keys(this.errors).length > 0)
				return;

			this.$root.$.data.network = client.network.create(
				{auth: this.$root.$.auth.data},
				data
			)

			this.$parent.networkPromise = this.$root.$.data.network.$promise
			this.$parent.networkPromise.then(function(network) {
					this.$parent.$set('networkPromise', undefined)
					this.$root.$.data.networks.push(network)
					this.$root.$.data.$set('network', network)
					Finch.navigate('/dashboard/' + network.key)
				}.bind(this),
				function(err) {
					this.$parent.networkPromise = undefined
					this.$parent.$.notify.set('Failed to create network: ' + err.error.message, 'danger')
				}.bind(this))
		},

		createChannel: function(data, ev) {
			ev.preventDefault()

			if (!data.name)
				this.$set('errors.name', "Please name your channel")
			else
				delete this.errors.name

			if (!this.address)
				this.$set('errors.address', "Specify the device UID")
			else if (this.address <= 0 || this.address > 0xFFFFFFFF)
				this.$set('errors.address', "Address must be in range 1..4294967295")
			else if (this.address <= 0 || this.address > 0xFFFFFF00)
				this.$set('errors.address', "Address cannot be in group range ff:ff:ff:00 - ff:ff:ff:ff")
			else
				delete this.errors.address

			console.log(this.errors);

			if (Object.keys(this.errors).length > 0)
				return

			// yes, i don't know about filters
			data.address = this.address
			this.channel = client.device.create(
				{ auth: this.$root.$.auth.data },
				data,
				{ network: this.network.key }
			)

			this.channel.$promise.then(function(resp) {
				this.channel.$promise = this.network.$get({auth: this.$root.$.auth.data}).$promise
				this.channel.$promise.then(function(network) {
						this.$root.$.data.$set('network', vals);
						this.$root.$.data.$set('network.channels', vals.channels);

						this.$parent.$.notify.set('Channel was created, try refreshing if the page does not move on', 'success')
				})
			}.bind(this), function(err) {
				if (409 === err.status) {
					this.$set('errors.address', "It seems like something already occupies this address");
					this.network.$get({auth: this.$root.$.auth.data});
				} else {
					this.$parent.$.notify.set('Ops, an error occured: ' + err.error, 'danger');
				}
			}.bind(this));
		}
	},

	computed: {
		network: function() {
			return this.$root.$.data.network
		},

		networkPatch: function() {
			return this.$parent.networkPatch
		},

		networkPromise: function() {
			return this.$parent.networkPromise
		},
		networkPromise: function() {
			return this.$parent.networkPromise
		},

		address: function() {
			if (this.channel.address.match(/^(?:[0-9a-f]{1,2}:){0,3}[0-9a-f]{1,2}$/i)) {
				return parseInt(_.map(this.channel.address.split(':'), function(m) {
					return ("0" + m).slice(-2, 4);
				}).reverse().join(""), 16)
			} else if(this.channel.address.match(/^(?:[0-9]{0,3}\.){0,3}[0-9]{0,3}$/)) {
				return parseInt(_.map(this.channel.address.split('.'), function(m) {
					return parseInt(m).toString(16);
				}).reverse().join(''), 16);
			} else if(this.channel.address.match(/^[0-9]*$/)) {
				return parseInt(this.channel.address);
			} else {
				return -1;
			}
		},

		chanuidbytes: function() {
			if (!this.network)
				return [];

			var key = Object.keys(this.network.channels)[0];
			return _.filter(("00000000" + this.network.devicemap[key].address.toString(16))
				.slice(-8, 16)
				.split(/(..)/));
		},

		nidbytes: function() {
			if (!this.network)
				return [];

			return _.filter(("00000000" + parseInt(this.network.key, 36).toString(16))
				.slice(-8, 16)
				.split(/(..)/));
		}
	}
}
</script>
