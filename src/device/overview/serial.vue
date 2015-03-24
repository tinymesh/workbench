<style lang="css">
	
</style>

<template lang="html">
				<div class="col-xs-12">

					<pre>{{output}}</pre>
					<textarea
						v-model="serialInput"
						v-on="keyup:sendSerial | key enter"
						class="form-control" rows="2"></textarea>

					<div class="action">
						<div class="pull-right">
							<label>
								<input v-model="useACK" type="checkbox"> Request acknowledge
							</label>
							&nbsp;

							<div class="btn-group dropdown-control">
								<button type="submit" class="btn btn-default">
									Format <b>({{serialFormat}})</b>
								</button>
								<button type="submit" class="btn btn-default">
									<span class="caret">&nbsp;</span>
								</button>

								<ul class="dropdown-menu" role="menu">
									<li><a v-on="click: serialFormat = 'ASCII'">ASCII</a></li>
									<li><a v-on="click: serialFormat = 'HEX'">HEX</a></li>
								</ul>
							</div>

							<button
								type="submit"
								v-on="click: sendSerial(serialInput, $event)"
								class="btn btn-primary">

								<span class="glyphicon glyphicon-log-in">&nbsp;</span>
								Send
							</button>
						</div>
					</div>
				</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client')

var hexToString = function(buf) {
	buf =  "0" + buf.replace(/(0x|\\x|\s)/g, '')
	var parts = buf.slice( (-1 * buf.length) + (buf.length % 2)).split('')

	var outer = ""
	var out = _.reduce(parts, function(acc, v, i) {
		if (1 === i % 2) {
			outer += v
			return acc + String.fromCharCode(parseInt(outer, 16))
		} else {
			outer = v
			return acc
		}
	}, "");

	return out.replace(/\t/g, "\\t")
					.replace(/\n/g, "\\n")
					.replace(/\v/g, "\\v")
					.replace(/\f/g, "\\f")
					.replace(/\r/g, "\\r")
}

module.exports = {
	data: function() {
		return {
			buffer: [],
			cmdnumber: 0,

			serialInput: '',
			serialFormat: 'ASCII',

			useACK: false
		}
	},

	components: {},


	events: {
		'data:msg:device': function(msg) {
			if (msg['proto/tm'] && msg['proto/tm'].detail === 'ack' || msg['proto/tm'].detail === 'nak')
				this.buffer.push([
					'ack',
					msg.key,
					msg.datetime,
					msg['proto/tm'].packet_number,
					"(" + msg['proto/tm'].detail + ": " + msg['proto/tm'].cmd_number + ")"])

			if (msg['proto/tm'] && msg['proto/tm'].detail === 'serial')
				this.buffer.push([
					'event',
					msg.key,
					msg.datetime,
					msg['proto/tm'].packet_number,
					msg['proto/tm'].data])

			if (msg['proto/tm'] && msg['proto/tm'].command === 'serial')
				this.buffer.push([
					'command',
					msg.key,
					msg.datetime,
					msg['proto/tm'].cmd_number,
					msg['proto/tm'].data])

			if (this.buffer.length > 20)
				this.buffer.shift()
		}
	},

	computed: {
		output: function() {
			return [
				" >> Serial console, send some data or just wait for data to be received",
				" >> Make sure to select the input format, HEX or ASCII!\n\n"
			].concat(this.buffer.map(function(v) {
				var
					arrow = ('command' === v[0] ? ' >> ' : ' << '),
					value = this.serialFormat === 'ASCII' && v[0] !== 'ack' ? hexToString(v[4]) : v[4]

				return v[2] + '[' + v[3] + ']' + arrow + value
			}.bind(this)))
			.join("\r\n")
		}
	},

	methods: {
		sendSerial: function(buf, ev) {
			ev.preventDefault()

			var value = buf
			if ('ASCII' === this.serialFormat)
				value = value
								.replace(/\\a/g, "\a")
								.replace(/\\t/g, "\t")
								.replace(/\\n/g, "\n")
								.replace(/\\v/g, "\v")
								.replace(/\\f/g, "\f")
								.replace(/\\r/g, "\r")
			else if ('HEX' === this.serialFormat)
				value = value.replace(/\s/g, '')

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'serial',
						'data': value,
						'cmd_number': (++this.cmdnumber % 128) + (this.useACK ? 128 : 1)
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device,
					'data-encoding': 'ASCII' === this.serialFormat ? 'binary' : 'hex',
				}
			).$promise.then(
				function(msg) {},
				function(err) {
					this.$root.$.view.$.notify.set('Failed to send message: ' + err.body.error, 'danger')
				}.bind(this))
		},
	},
}
</script>
