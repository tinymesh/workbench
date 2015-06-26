<style lang="css">

@-webkit-keyframes enter {
  0% {
    opacity: 0;
    top: -10px;
  }
  5% {
    opacity: 1;
    top: 0px;
  }
  50.9% {
    opacity: 1;
    top: 0px;
  }
  55.9% {
    opacity: 0;
    top: 10px;
  }
}
@keyframes enter {
  0% {
    opacity: 0;
    top: -10px;
  }
  5% {
    opacity: 1;
    top: 0px;
  }
  50.9% {
    opacity: 1;
    top: 0px;
  }
  55.9% {
    opacity: 0;
    top: 10px;
  }
}
@-moz-keyframes enter {
  0% {
    opacity: 0;
    top: -10px;
  }
  5% {
    opacity: 1;
    top: 0px;
  }
  50.9% {
    opacity: 1;
    top: 0px;
  }
  55.9% {
    opacity: 0;
    top: 10px;
  }
}


.blockloader {
	display: none;
	position: fixed;
	z-index: 99;
	height: 100%;
	width: 100%;
	background: #eee;
	opacity: 0.8;
}

body.blockloader-loading .blockloader {
	display: block;
}

body.blockloader-init .loader {
	position: absolute;
	left: 50%;
	top: 45%;
	margin-top: -27.5px;
	margin-left: -27.5px;
	z-index: 99;
}

.blockloader-loading .navbar { border: none; }

.blockloader-loading .blockloader {
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	background: #eee;
	opacity: 0.8;
}


.loader {
  position: absolute;
  left: 50%;
  top: 250px;
  margin-left: -27.5px;
	z-index: 99;
}

.square {
  background: #777;
  width: 15px;
  height: 15px;
  float: left;
  top: -10px;
  margin-right: 5px;
  margin-top: 5px;
  position: relative;
  opacity: 0;
  -webkit-animation: enter 6s infinite;
  animation: enter 6s infinite;
}

body.blockloader-init .square {
  background: #444;
}

.enter {
  top: 0px;
  opacity: 1;
}

.square:nth-child(1) {
  -webkit-animation-delay: 1.8s;
  -moz-animation-delay: 1.8s;
  animation-delay: 1.8s;
}

.square:nth-child(2) {
  -webkit-animation-delay: 2.1s;
  -moz-animation-delay: 2.1s;
  animation-delay: 2.1s;
}

.square:nth-child(3) {
  -webkit-animation-delay: 2.4s;
  -moz-animation-delay: 2.4s;
  animation-delay: 2.4s;
  background: #ecb85e;
}

.square:nth-child(4) {
  -webkit-animation-delay: 0.9s;
  -moz-animation-delay: 0.9s;
  animation-delay: 0.9s;
}

.square:nth-child(5) {
  -webkit-animation-delay: 1.2s;
  -moz-animation-delay: 1.2s;
  animation-delay: 1.2s;
}

.square:nth-child(6) {
  -webkit-animation-delay: 1.5s;
  -moz-animation-delay: 1.5s;
  animation-delay: 1.5s;
}

.square:nth-child(8) {
  -webkit-animation-delay: 0.3s;
  -moz-animation-delay: 0.3s;
  animation-delay: 0.3s;
}

.square:nth-child(9) {
  -webkit-animation-delay: 0.6s;
  -moz-animation-delay: 0.6s;
  animation-delay: 0.6s;
}

.clear {
  clear: both;
}

.last {
  margin-right: 0;
}

.loader { min-height: 100%; }


/**
 * Fade for initial load
 */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.fade {
  opacity: 0;
  animation: fadeIn .5s ease-in 1 forwards;
}

.is-paused {
  animation-play-state: paused;
}

</style>

<template lang="html">
<div class="blockloader">
	<div class="loader" v-show="loading">
		<div class="square" ></div>
		<div class="square"></div>
		<div class="square last"></div>
		<div class="square clear"></div>
		<div class="square"></div>
		<div class="square last"></div>
		<div class="square clear"></div>
		<div class="square "></div>
		<div class="square last"></div>
	</div>
</div>

</template>

<script lang="js">
var toggleBodyClass = function(cssclass, cond) {
	var elem = document.getElementsByTagName("body")[0]

	if (!cond)
		elem.className = _.without(elem.classList, cssclass).join(' ')
	else
		elem.className = _.union(elem.classList, [cssclass]).join(' ')
}

module.exports = {
	data: function() {
		return {
			promises: [],
			once: true
		}
	},

	compiled: function() {
		toggleBodyClass('blockloader-init', false)
		this.once = false
		document.getElementById("initial-loader").remove()
	},

	methods: {
		await: function(promise) {
			var ref = Math.random().toString()

			this.promises.push(ref)

			var clear = function(arg) {
				this.promises = _.without(this.promises, ref)
				this.setBodyState()
				return arg
			}.bind(this)

			promise.then(clear, clear)

			this.setBodyState()

			return promise
		},

		setBodyState: function() {
			toggleBodyClass('blockloader-loading', 0 !== this.promises.length)
		}
	},

	computed: {
		loading: function() {
			return this.once || 0 !== this.promises.length
		}
	}
}
</script>
