require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash');

module.exports = {
	template: require('./template.html'),
	replace: true,
	compiled: function () {
		this.ev = client.message.stream(this.params.network, this.params.device, {auth: this.$root.auth});
		this.ev.addEventListener('msg', function(ev) {
			var ev = JSON.parse(ev.data);
		
			console.log(ev);

			if (ev.selector[1] !== (this.params || {}).device|| !ev['proto/tm'])
				return;

			console.log(ev);

			if (ev['proto/tm'].detail === 'serial' || ev['proto/tm'].command === 'serial') {
				this.data += (new Date(ev.datetime)).toLocaleString() + " < (" + ev['proto/tm'].cmd_number + ") " + ev['proto/tm'].data + "\r\n";
			} else if (ev['proto/tm'].detail === 'ack' || ev['proto/tm'].detail === 'nak') {
				this.data += (new Date(ev.datetime)).toLocaleString() + " < (" + ev['proto/tm'].cmd_number + ") == " + ev['proto/tm'].detail + "\r\n";
			} else {
				this.data += (new Date(ev.datetime)).toLocaleString() + " < " + JSON.stringify(ev['proto/tm']).replace(/[{}"']/g, '') + "\r\n";
			}
		}.bind(this));
	},
	data: function () {
		return {
			ev: null,
			type: 'serial',
			serialOut: '',
			cmdOut: '',
			cmdOutErr: '',
			data: ''
		}
	},
	methods: {
		send: function(e) {
			e.preventDefault();
			var msg = {};

				if (this.type === 'serial') {
					msg = '"command":"serial","data":"' + this.serialOut + '"';
				} else {
				// normalize data for json parsing
					msg = ('"' + this.cmdOut)
						.replace(/:/, "\":")
						.replace(/ ([a-z])/, " \"$1")
						.replace(/([a-z])$/, "$1\"")
				}

			this.cmdOutErr = undefined;
			try {
				cmd = JSON.parse('{"type":"command",' + msg + '}');
				client.message.create(
						this.params.network,
						this.params.device,
						{'proto/tm': cmd},
						{auth: this.$root.auth})
			} catch(e) {
				this.cmdOutErr = true;
			}
		}
	}
}
