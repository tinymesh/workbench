<style lang="css">

.gpio-overview > .gpio {
	border-bottom: 1px dotted #ddd;
	padding: 0rem 2rem 0rem;
	height: 5rem;
	}
	.gpio-overview > .gpio .value > .digital-output {
		margin-top: 1.5rem;
	}
	.gpio-overview .gpio .title {
		font-weight: bold;
		color: #777;
		text-transform: uppercase;
		font-size: 1.2rem;
		margin-top: 1.8rem;
		}
	.gpio-overview > .gpio .value .output {
		margin-top: 1.6rem;
	}
	.gpio-overview .gpio .value .type {
		font-weight: bold;
		color: #ccc;
		text-transform: uppercase;
		font-size: 1rem;
		margin-top: 1.9rem;
		}

	.gpio-overview > .gpio:hover {
		background: #efefef;
		border-bottom-color: #aaa;
		}
		 .gpio-overview .gpio:hover .value .type {
			 color: #bbb;
			 }

	.gpio-overview .volt {
		font-size: 1.2rem;
	}
	.gpio-overview .analogue-cube {
		margin-top: -0.5rem;
	}


svg {
  font: 10px sans-serif;
}

.line {
  fill: none;
  stroke: #999;
  stroke-width: 1.5px;
}
.tick text { display: none; }

.axis path,
.axis line {
  fill: none;
  stroke: #ddd;
  shape-rendering: crispEdges;
}
</style>

<template lang="html">
			<div class="row">
				<div>
					<div v-if="gpios.length === 0">
						<p class="lead text-center">
							No GPIO configuration found, did you try to fetch the config?
							<button
								v-on="click: getConfig"
								type="submit"
								class="btn btn-info">
								Request device status
							</button>
						</p>
					</div>

					<div v-if="gpios.length > 0" class="gpio-overview container-fluid">
						<div
							class="gpio col-md-5 col-md-offset-{{$index % 2}}"
							v-repeat="gpio: gpios">
							<div class="">
								<div class="title col-xs-2">GPIO {{$index}}</div>

								<div class="value col-xs-10">
									<span
										v-if="0 === gpio.config || 4 === gpio.config"
										class="type col-xs-5">Digital Output</span>
									<div
										v-if="0 === gpio.config || 4 === gpio.config"
										class="digital-output col-xs-5">
										<button
											v-on="click: setOutput($index, 1, $event)"
											class="btn btn-sm btn-success">
												On
										</button>
										<button
											v-on="click: setOutput($index, 0, $event)"
											class="btn btn-sm btn-primary">
												Off
										</button>
									</div>

									<span
										v-if="1 === gpio.config"
										class="type col-xs-5">Digital Input</span>
									<div
										v-if="1 === gpio.config"
										class="output digital-input col-xs-5">
										<span
											v-show="msgs.length > 0 && 1 === msgs[msgs.length - 1]['proto/tm'].dio['gpio_' + $index]"
											class="label label-success">On
										</span>

										<span
											v-show="msgs.length > 0 && 0 === msgs[msgs.length - 1]['proto/tm'].dio['gpio_' + $index]"
											class="label label-danger">Off
										</span>

										<span
											v-show="undefined  === msgs[msgs.length -1]"
											class="label label-warning">No data
										</span>
									</div>

									<span
										v-if="2 === gpio.config"
										class="type col-xs-5">Analogue Input</span>
									<div
										v-if="2 === gpio.config"
										class="output analogue-input col-xs-5">

										<span
											v-if="msgs.length === 0"
											class="label label-warning pull-left">No data
										</span>
										<span
											v-if="msgs.length > 0"
											class="col-xs-4 volt">
											{{(msgs[msgs.length - 1]['proto/tm']['aio' + $index] / 2047 * 1.25) | round 2}} V
										</span>

										<div class="analogue-cube analogue-cube-{{$index}} col-xs-5"></div>
									</div>

									<span
										v-if="3 === gpio.config"
										class="type col-xs-5">PWM Output</span>
									<div
										v-if="3 === gpio.config"
										class="output pwm-output col-xs-5">
										<div class="col-xs-9">
											<input
												id="pwmoutput"
												type="range"
												min="0"
												max="100"
												step="1"
												v-model="pwmOutput"
												v-on="change: setPWM(pwmOutput, $event)"
												value="{{device['proto/tm'].config.gpio_7.pwm_default || pwmOutput"
												number />
										</div>
										<div class="col-xs-2">
											<span>{{pwmOutput}}%</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="action text-right">
						<button
							v-on="click: getStatus"
							type="submit"
							class="btn btn-primary">
							Request device status
						</button>
					</div>
				</div>
			</div>
</template>

<script lang="js">
var
	client = require('tinymesh-cloud-client'),
	d3 = require('d3/d3')

var cubes = {}

var analogueChart = function(cubes, ref, opts) {
	if (cubes[ref])
		return cubes[ref]

	cubes[ref] = {
		data: []
	}


	opts = opts || {}
	opts.n = opts.n || 20
	opts.height = opts.height || 30
	opts.width = opts.width || 120

	for (var i = 0; i < opts.n; i++)
		cubes[ref].data.push(0)

	var x = d3.scale.linear()
	    .domain([0, opts.n - 1])
	    .range([0, opts.width]);

	var y = d3.scale.linear()
	    .domain([-1, 1])
	    .range([opts.height, 0]);

	var line = d3.svg.line()
	    .x(function(d, i) { return x(i); })
	    .y(function(d, i) { return y(d); });

	var svg = d3.select('.' + ref)
		.append("svg")
	    .attr("width", opts.width)
	    .attr("height", opts.height)
	  .append("g")

	svg.append("defs")
		.append("clipPath")
	    .attr("id", "clip")
	  .append("rect")
	    .attr("width", opts.width)
	    .attr("height", opts.height);

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + y(0) + ")")
	    .call(d3.svg.axis().scale(x).orient("bottom"));

	svg.append("g")
	    .attr("class", "y axis")
	    .call(d3.svg.axis().scale(y).orient("left"));

	var path = svg.append("g")
	    .attr("clip-path", "url(#clip)")
	  .append("path")
	    .datum(cubes[ref].data)
	    .attr("class", "line")
	    .attr("d", line);

	cubes[ref].svg = svg
	cubes[ref].line = line
	cubes[ref].path = path
	cubes[ref].x = x
	cubes[ref].y = y
	cubes[ref].append = function(data) {
		cubes[ref].data.push(data)

		path
			.attr('d', line)
			.attr('transform', null)
   .transition()
      .duration(500)
      .ease("linear")
      .attr("transform", "translate(" + x(-1) + ",0)")

		cubes[ref].data.shift()
	}

	return cubes[ref]
}

module.exports = {
	data: function() {
		return {
			pwmOutput: 100,
		}
	},

	components: {},

	ready: function() {
		this.device.$promise.then(function(device) {
			this.pwmOutput = 100 - device['proto/tm'].pwm
		}.bind(this))
	},

	events: {
		'data:msg:device': function(msg) {
			if (2 === this.device['proto/tm'].config.gpio_0.config && !cubes['analogue-cube-0'])
				analogueChart(cubes, 'analogue-cube-0')

			if (2 === this.device['proto/tm'].config.gpio_1.config && !cubes['analogue-cube-1'])
				analogueChart(cubes, 'analogue-cube-1')

			if (cubes['analogue-cube-0'])
				cubes['analogue-cube-0'].append(msg['proto/tm'].aio0 / 2047 * 1.25)

			if (cubes['analogue-cube-1'])
				cubes['analogue-cube-1'].append(msg['proto/tm'].aio1 / 2047 * 1.25)


			return false;
		}
	},

	computed: {
		gpios: function() {
			if (!this.device['proto/tm'] || !this.device['proto/tm'].config)
				return []

			var config = this.device['proto/tm'].config
			if (config.gpio && undefined !== config.gpio_0.config) {
				return [
					config.gpio_0, config.gpio_1, config.gpio_2,
					config.gpio_3, config.gpio_4, config.gpio_5,
					config.gpio_6, config.gpio_7]
			} else {
				return []
			}
		},
	},

	methods: {
		setPWM: function(value, ev) {
			ev.preventDefault()

			value = parseInt(value)

			if (_.isNaN(value)) {
				this.$parent.$.notify.set('Failed to set PWM output', 'danger')
				return
			}

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'set_pwm',
						'pwm': 100 - value
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
		},

		setOutput: function(gpio, value, ev) {
			ev.preventDefault()

			value = parseInt(value)

			if (_.isNaN(value)) {
				this.$parent.$.notify.set('Failed to set output: gpio_' + gpio, 'danger')
				return
			}

			var outputs = {}
			outputs["gpio_" + gpio] = !!value
			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'set_output',
						'gpio': outputs
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
		},

		getStatus: function(ev) {
			ev.preventDefault()

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'get_status'
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
		},

		getConfig: function(ev) {
			ev.preventDefault()

			client.message.create(
				{ auth: this.$root.$.auth.data, },
				{
					'proto/tm': {
						'type': 'command',
						'command': 'get_config'
					}
				},
				{
					'network': this.params.network,
					'device': this.params.device
				}
			)
		},
	},
}
</script>
