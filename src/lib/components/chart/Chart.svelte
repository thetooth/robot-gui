<script lang="ts">
	import { onMount, getContext, onDestroy } from 'svelte'
	import CandyGraph, { createDefaultFont, LinearScale, LineStrip, OrthoAxis, CartesianCoordinateSystem } from 'candygraph'

	import { setChartContext, setLineContext, getChartContext, getLineContext } from './context'

	export let timeBase: number
	export let verticalScale: number
	export let xScale: number = 1
	export let yScale: number = 1
	export let xOffset: number = 0
	export let yOffset: number = 0
	export let style = ''

	setChartContext()
	setLineContext()

	const id = Math.random().toString(36).substring(7)
	const lines = getLineContext()

	let ready = false
	let resized = true
	let renderContext = null
	let canvas = null
	let dpr = window.devicePixelRatio
	let cg = null
	let viewport = null
	let yCoords: LinearScale = null
	let axisCoords: CartesianCoordinateSystem = null
	let timeCoords: CartesianCoordinateSystem = null
	let font = null
	let axes: OrthoAxis

	let clicked = false

	const xs = []
	for (let i = 0; i < timeBase; i++) {
		xs[i] = i - timeBase
	}

	function updateCoordinateSystem() {
		if (!ready) return

		axisCoords.xscale.range = [32 * dpr, viewport.width - 16 * dpr]
		axisCoords.yscale.range = [32 * dpr, viewport.height - 16 * dpr]
		timeCoords.xscale.range = [32 * dpr, viewport.width - 16 * dpr]
		timeCoords.yscale.range = [32 * dpr, viewport.height - 16 * dpr]

		timeCoords.xscale.domain = [-timeBase * xScale + xOffset * timeBase, 0 + xOffset * timeBase]
		timeCoords.yscale.domain = [-verticalScale * yScale + yOffset * verticalScale, verticalScale * yScale + yOffset * verticalScale]
		axisCoords.xscale.domain = [-timeBase * xScale + xOffset * timeBase, 0 + xOffset * timeBase]
		// axisCoords.yscale.domain = [-timeBase * yScale + yOffset, 1 * yScale + yOffset]
	}

	function resize() {
		resized = false

		dpr = window.devicePixelRatio

		let parent = canvas.parentNode as HTMLElement
		viewport = { x: 0, y: 0, width: parent.clientWidth * dpr, height: parent.clientHeight * dpr }

		canvas.width = parent.clientWidth
		canvas.height = parent.clientHeight

		// Update renderer
		canvas.style.width = `${canvas.width}px`
		canvas.style.height = `${canvas.height}px`

		canvas.width *= dpr
		canvas.height *= dpr

		// Update coordinate system
		updateCoordinateSystem()
	}

	function zoom(event) {
		event.preventDefault()
		event.stopImmediatePropagation()
		if (event.ctrlKey) {
			if (event.deltaY > 0) {
				xScale *= 1.1
				xScale = Math.min(xScale, 1)
			} else {
				xScale /= 1.1
			}
			return false
		} else {
			if (event.deltaY > 0) {
				yScale *= 1.1
			} else {
				yScale /= 1.1
			}
			return false
		}
	}

	function drag(event) {
		if (clicked) {
			event.preventDefault()
			event.stopImmediatePropagation()
			// xOffset -= event.movementX * (xScale / (canvas.clientWidth * 2)) * dpr
			yOffset += event.movementY * (yScale / canvas.clientHeight) * dpr
			console.log(xOffset, yOffset)
		}
	}

	function render() {
		if (resized) {
			resize()
		}

		updateCoordinateSystem()

		$lines.forEach((line) => {
			var aRgbHex = line.color.match(/.{1,2}/g)
			var aRgb = [parseInt(aRgbHex[0], 16) / 255.0, parseInt(aRgbHex[1], 16) / 255.0, parseInt(aRgbHex[2], 16) / 255.0]

			const l = new LineStrip(cg, xs, line.points.toArray(), {
				colors: [...aRgb, 1],
				widths: 3
			})

			cg.render(timeCoords, viewport, [l])

			l.dispose()
		})

		let xAxis = new OrthoAxis(cg, axisCoords, 'x', font, {
			labelSide: 1,
			tickOffset: -2.5,
			tickLength: 6,
			tickStep: (timeBase / 8) * xScale,
			labelFormatter: (n) => n.toFixed(1)
		})
		let yAxis = new OrthoAxis(cg, axisCoords, 'y', font, {
			tickOffset: 2.5,
			tickLength: 6,
			tickStep: (verticalScale / 2) * yScale,
			labelFormatter: (n) => n.toFixed(3)
		})

		cg.render(axisCoords, viewport, [xAxis, yAxis])

		xAxis.dispose()
		yAxis.dispose()

		cg.copyTo(viewport, canvas)

		renderContext = requestAnimationFrame(render)
	}

	onMount(async () => {
		console.log('Chart is mounted')
		canvas = document.getElementById(id) as HTMLCanvasElement

		cg = new CandyGraph({
			alpha: true,
			canvas: canvas
		})
		resize()

		// Create a coordinate system from two linear scales.
		yCoords = new LinearScale([-1, 10], [32 * dpr, viewport.height - 16 * dpr])
		axisCoords = new CartesianCoordinateSystem(cg, new LinearScale([-timeBase, 0], [32 * dpr, viewport.width - 32 * dpr]), yCoords)
		timeCoords = new CartesianCoordinateSystem(cg, new LinearScale([-5, 0], [32 * dpr, viewport.width - 32 * dpr]), yCoords)

		// Load the default Lato font
		font = await createDefaultFont(cg)

		// Clear the viewport.
		cg.clear([1, 1, 1, 1])

		window.addEventListener('resize', resize)

		ready = true

		renderContext = requestAnimationFrame(render)
	})

	onDestroy(async () => {
		window.removeEventListener('resize', () => {
			resized = true
		})
		ready = false
		cancelAnimationFrame(renderContext)
		cg.destroy()
		cg = null
	})
</script>

<div {style}>
	<canvas {id} on:wheel={zoom} on:mousedown={() => (clicked = true)} on:mouseup={() => (clicked = false)} on:mouseleave={() => (clicked = false)} on:mousemove={drag} />
</div>

<slot />
