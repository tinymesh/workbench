require('insert-css')(require('./style.css'))

var client = require('tinymesh-cloud-client/tinymesh-cloud-client'),
	_ = require('lodash');

var mapping = {
	"rf.channel":                   {name: "RF Channel",   readonly: true},
	"rf.power":                     {name: "RF Power",     readonly: true},
	"rf.data_rate":                 {name: "RF Data Rate", readonly: true},
	"net.rssi_threshold":           {name: "RSSI Threshold"},
	"net.rssi_cc_assesment":        {name: "RSSI Clear Channel Assessment Level"},
	"net.hiam_time":                {name: "HIAM Time"},
	"ima.time":                     {name: "IMA Time"},
	"ima.time_base":                {name: "IMA Timbase"},
	"ima.on_connect":               {name: "IMA On connect"},
	"ima.data_field":               {name: "IMA Data field"},
	"ima.address_field":            {name: "IMA Address Field"},
	"ima.trig_hold":                {name: "IMA Trig Hold"},
	"net.connect_check_time":       {name: "Connect Check Time"},
	"net.max_jump_level":           {name: "Max Jump Level"},
	"net.max_jump_count":           {name: "Max Jump Count"},
	"net.max_packet_latency":       {name: "Max Packet Latency"},
	"net.tx_retry_limit":           {name: "TX Retry Limit"},
	"uart.timeout":                 {name: "UART Timeout"},
	"device.protocol_mode":         {name: "Protocol Mode"},
	"device.type":                  {name: "Device Type"},
	"device.locator":               {name: "Locator"},
	"device.uid":                   {name: "UID", address: true, readonly: true},
	"device.sid":                   {name: "SID", address: true, readonly: true},
	"net.excellent_rssi":           {name: "Excellent RSSI", readonly: true},
	"gpio_0.config":                {name: "GPIO 0 Config"},
	"gpio_0.trigger":               {name: "GPIO 0 Trigger"},
	"gpio_0.analogue_high_trig":    {name: "GPIO 0 Analogue High Trig"},
	"gpio_0.analogue_low_trig":     {name: "GPIO 0 Analogue Low Trig"},
	"gpio_0.analogue_sample_rate":  {name: "GPIO 0 Analogue Sample Rate"},
	"gpio_1.config":                {name: "GPIO 1 Config"},
	"gpio_1.trigger":               {name: "GPIO 1 Trigger"},
	"gpio_1.analogue_high_trig":    {name: "GPIO 1 Analogue High Trig"},
	"gpio_1.analogue_low_trig":     {name: "GPIO 1 Analogue Low Trig"},
	"gpio_1.analogue_sample_rate":  {name: "GPIO 1 Analogue Sample Rate"},
	"gpio_2.config":                {name: "GPIO 2 Config"},
	"gpio_2.trigger":               {name: "GPIO 2 Trigger"},
	"gpio_3.config":                {name: "GPIO 3 Config"},
	"gpio_3.trigger":               {name: "GPIO 3 Trigger"},
	"gpio_4.config":                {name: "GPIO 4 Config"},
	"gpio_4.trigger":               {name: "GPIO 4 Trigger"},
	"gpio_5.config":                {name: "GPIO 5 Config"},
	"gpio_5.trigger":               {name: "GPIO 5 Trigger"},
	"gpio_6.config":                {name: "GPIO 6 Config"},
	"gpio_6.trigger":               {name: "GPIO 6 Trigger"},
	"gpio_7.config":                {name: "GPIO 7 Config"},
	"gpio_7.trigger":               {name: "GPIO 7 Trigger"},
	"gpio_7.pwm_default":           {name: "GPIO 7 PWM Default"},
	"gpio.input_debounce":          {name: "Input Debounce (GPIO)"},
	"uart.cts_hold_time":           {name: "CTS Hold Time"},
	"uart.baud_rate":               {name: "UART Baud rate"},
	"uart.bits":                    {name: "UART Bits"},
	"uart.parity":                  {name: "UART Parity"},
	"uart.stop_bits":               {name: "UART Stop bits"},
	"uart.flow_control":            {name: "UART Flow Control"},
	"uart.buffer_margin":           {name: "UART Buffer Margin"},
	"device.part":                  {name: "PART #", readonly: true},
	"device.hw_revision":           {name: "Hardware Revision", readonly: true},
	"device.fw_revision":           {name: "Firmware Revision", readonly: true},
	"security.level":               {name: "Security level"},
	"end_device.keepalive":         {name: "End Device keep alive"},
	"end_device.wakeon":            {name: "End Device wakeon"},
	"end_device.wakeon_port":       {name: "End Device wakeon port"},
	"device.indicators_timeout":    {name: "LED Indicators timeout"},
	"device.sniff_neighbours":      {name: "Sniff neighbours"},
	"device.command_ack":           {name: "Command ACK"},
	"device.sleep_or_rts_pin":      {name: "Sleep/RTS pin"},
	"pulse_counter.mode":           {name: "Pulse Counter Mode"},
	"pulse_counter.debounce":       {name: "Pulse Counter Debounce"},
	"net.connect_change_margin":    {name: "Connection Change Margin"},
	"cluster.device_limit":         {name: "Cluster Device Limit"},
	"cluster.rssi_threshold":       {name: "Cluster RSSI Threshold"},
	"device.detect_busy_network":   {name: "Detect Network Busy"},
	"rf_jamming.detect":            {name: "RF Jamming Detect"},
	"rf_jamming.port":              {name: "RF Jamming Port"},
	"pulse_counter.feedback_port":  {name: "Pulse Counter Feedback Port"},
	"pulse_counter.feedback":       {name: "Pulse Counter Feedback"},
	"group.membership":             {name: "Group memberships"},
	"net.command_accept_time":      {name: "Command Accept Time"},
	"net.command_retries":          {name: "Command Retries"},
	"rf.mac_rnd_mask_1":            {name: "MAC Random mask #1", readonly: true},
	"rf.mac_rnd_mask_2":            {name: "MAC Random mask #2", readonly: true}
};

var groupnames = {
	'device': 'Device',
	'ima': 'I\'m Alive Events (IMA)',
	'gpio': 'GPIO Support',
	'gpio_0': 'GPIO 0 Support',
	'gpio_1': 'GPIO 1 Support',
	'gpio_2': 'GPIO 2 Support',
	'gpio_3': 'GPIO 3 Support',
	'gpio_4': 'GPIO 4 Support',
	'gpio_5': 'GPIO 5 Support',
	'gpio_6': 'GPIO 6 Support',
	'gpio_7': 'GPIO 7 Support',
	'pulse_counter': 'Pulse Counter',
	'security': 'Security',
	'uart': 'UART',
	'net': 'Network Transport',
	'rf': 'Radio Settings',
	'rf_jamming': 'Jamming',
	'end_device': 'End Device',
	'cluster': 'Cluster Detection',
};

module.exports = {
	template: require('./template.html'),
	replace: true,
	compiled: function () {
	},
	data: function () {
		return {
			device: {},
			changeset: {},
			error: {}
		}
	},
	methods: {
		patch: function(field, ev) {
			var oldval = this.$get('device["proto/tm"].config.' + field);

			if (ev.target.value != oldval)
				this.$set('changeset.' + field, parseInt(ev.target.value));
			else
				this.$set('changeset.' + field, undefined);

			delete this.error[field];
		},
		has_changes: function(field) {
			return undefined !== this.$get('changeset.' + field);
		},
		publishchanges: function(e) {
			e.preventDefault();

			var ctx = this;
			client.device
				.update(this.params.network,
					this.params.device,
					{'proto/tm': {'config': this.changeset}},
					{auth: this.$root.auth})
				.$promise.then(function(body) {
					ctx.$set('changeset', {});
					ctx.$set('device', _.extend(ctx.device, body));
					ctx.$log();
					ctx.$add('');
				}, function(err) {
					_.each(err.body.fields, function(v, k) {
						ctx.error[k] = v;
						ctx.$add('');
					});
				});
		}
	},
	computed: {
		changes: function() {
			var set = {};
			var config = (this.device['proto/tm'].config || {});

			_.each(this.changeset, function(gval, group) {
				_.each(gval, function(val, key) {
					set[group + '.' + key] = {
						key: group + '.' + key,
						oldval: (config[group] || {})[key],
						newval: val
					};
				});
			});

			return Object.keys(set).length > 0 ? set : undefined;
		},
		staged: function() {
			var config = (this.device['proto/tm'].config || {}),
				stage = {};

			_.each(config._staged, function(command, cmdkey) {
				_.each(command, function(gval, group) {
					_.each(gval, function(val, field) {
						if (stage[group + '.' + field]) {
							stage[group + '.' + field].cmds.push(cmdkey);
							stage[group + '.' + field].vals.push(val);
						} else {
							stage[group + '.' + field] = {
								vals: [val],
								cmds: [cmdkey],
							};
						}
					});
				});
			});
			_.map(stage, function(item) {
				item.vals = _.uniq(item.vals)
				return item;
			});

			return Object.keys(stage).length > 0 ? stage : undefined;
		},
		config: function() {
			if (!this.device['proto/tm'].config)
				return;

			var cfg = {
				"Device": {},
				'I\'m Alive Events (IMA)': {},
				'GPIO Support': {},
				'GPIO 0 Support': {},
				'GPIO 1 Support': {},
				'GPIO 2 Support': {},
				'GPIO 3 Support': {},
				'GPIO 4 Support': {},
				'GPIO 5 Support': {},
				'GPIO 6 Support': {},
				'GPIO 7 Support': {}
			};
			_.each(this.device['proto/tm'].config, function(gval, group) {
				if ("_staged" === group)
					return;

				_.each(gval, function(val, key) {
					var res = mapping[group + '.' + key];

					var groupkey = res.group || group;
						groupname = groupnames[groupkey] || groupkey;

					if (!cfg[groupname])
						cfg[groupname] = {};

					cfg[groupname][key] = _.extend({key: group + '.' + key, value: val}, res);
				});
			});

			return cfg;
		}
	}
}
