<script>
	import { onMount } from 'svelte'
	import { dro } from '../store'
	import { Content, FormGroup, Slider } from 'carbon-components-svelte'
	import { WebglPlot, WebglLine, ColorRGBA } from 'webgl-plot'
	import { CircularBuffer } from 'cirbuf'

	let wglp = null
	let numX = 10_000
	let xScale = 1.0
	let yScale = 0.001
	let yScaleMultiplier = 1000.0
	let xOffset = 0.0
	let yOffset = 0.0
	let clicked = false
	let x = new WebglLine(new ColorRGBA(0, 0.75, 0, 1), numX)
	let y = new WebglLine(new ColorRGBA(0.75, 0, 0, 1), numX)
	let z = new WebglLine(new ColorRGBA(0, 0, 0.75, 1), numX)
	let r = new WebglLine(new ColorRGBA(0, 0.75, 0.75, 1), numX)

	let buffer = new CircularBuffer(numX)
	let buffer2 = new CircularBuffer(numX)
	for (let i = 0; i < numX; i++) {
		buffer.push(i)
		buffer2.push(i)
	}

	dro.subscribe((data) => {
		buffer.push(data.ethercat)
		buffer2.push(data.drives[1])
	})

	$: xScale, yScale, xOffset, yOffset, scale()

	function scale() {
		if (!wglp) return

		wglp.gScaleX = xScale
		wglp.gScaleY = yScale / yScaleMultiplier
		wglp.gOffsetX = -xScale + 1 + xOffset
		wglp.gOffsetY = -yOffset * (yScale / yScaleMultiplier)
	}

	function newFrame() {
		let data = buffer.toArray()
		let data2 = buffer2.toArray()
		// console.log(data.map((v) => v[0]))
		// x.replaceArrayY(data.map((v) => v.actualTorque))
		// y.replaceArrayY(data2.map((v) => v.actualTorque))
		x.replaceArrayY(data.map((v) => v.sync0 / 1000))
		// y.replaceArrayY(data.map((v) => v.compensation / 100))
		// z.replaceArrayY(data.map((v) => v.integral / 1000))
		// x.replaceArrayY(data.map((v) => v.alphaVelocity))
		// y.replaceArrayY(data.map((v) => v.betaVelocity))
		// z.replaceArrayY(data.map((v) => v.theta))
		// r.replaceArrayY(data.map((v) => v.phi))

		wglp.update()
		requestAnimationFrame(newFrame)
	}

	onMount(async () => {
		console.log('ChartsView is mounted')

		const canvas = document.querySelector('canvas.webgl')
		const devicePixelRatio = window.devicePixelRatio || 1
		canvas.width = canvas.clientWidth * devicePixelRatio
		// canvas.height = canvas.clientHeight *
		canvas.height = 1000

		canvas.addEventListener(
			'mousewheel',
			function (event) {
				event.preventDefault()
				event.stopImmediatePropagation()
				if (event.ctrlKey) {
					if (event.deltaY < 0) {
						xScale *= 1.1
					} else {
						xScale /= 1.1
					}
					return false
				} else {
					if (event.deltaY < 0) {
						yScale *= 1.1
					} else {
						yScale /= 1.1
					}
					return false
				}
			},
			false
		)
		canvas.addEventListener('mousedown', function (event) {
			clicked = true
		})
		canvas.addEventListener('mouseup', function (event) {
			clicked = false
		})
		canvas.addEventListener('mouseleave', function (event) {
			clicked = false
		})
		canvas.addEventListener('mousemove', function (event) {
			if (clicked) {
				// xOffset += event.movementX * (1 / xScale / (canvas.clientWidth / 2))
				yOffset += event.movementY * (yScaleMultiplier / yScale / (canvas.clientHeight / 2))
			}
		})

		x.arrangeX()
		y.arrangeX()
		z.arrangeX()
		r.arrangeX()

		wglp = new WebglPlot(canvas)
		wglp.gScaleX = xScale
		wglp.gScaleY = yScale
		wglp.addLine(x)
		// wglp.addLine(y)
		// wglp.addLine(z)
		// wglp.addLine(r)

		requestAnimationFrame(newFrame)
	})
</script>

<Content>
	<h2>Charts</h2>

	<canvas style="width: 100%" class="webgl"></canvas>

	<FormGroup>
		<Slider labelText="X Zoom" fullWidth min={1} max={10} step={0.001} bind:value={xScale} />
		<!-- <Slider labelText="X Offset" fullWidth min={-10.0} max={10.0} step={0.000001} bind:value={xOffset} /> -->
		<Slider labelText="Y Zoom" fullWidth min={0.1} max={1000} step={0.1} bind:value={yScale} />
		<!-- <Slider labelText="Y Offset" fullWidth min={-100.0} max={100.0} step={0.000001} bind:value={yOffset} /> -->
	</FormGroup>
</Content>
