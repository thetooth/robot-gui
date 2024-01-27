<script lang="ts">
	import { onMount, getContext, onDestroy, SvelteComponent } from 'svelte'
	import { Button, Tile } from 'carbon-components-svelte'
	import { Maximize, Download } from 'carbon-icons-svelte'
	import CandyGraph, { createDefaultFont, LinearScale, LineStrip, OrthoAxis, Grid, Text, CartesianCoordinateSystem, Font } from 'candygraph'

	import { setChartContext, setLineContext, getChartContext, getLineContext } from './context'

	export let title: string = ''
	export let bufferLength: number
	export let timeBase: number
	export let verticalScale: number
	export let xLabel: string = ''
	export let yLabel: string = ''
	export let xScale: number = 1
	export let yScale: number = 1
	export let xOffset: number = 0
	export let yOffset: number = 0
	export let grid: boolean = false
	export let style = ''
	let className = 'bx--tile'
	export { className as class }

	let axisColor = [0.35, 0.35, 0.35, 1]

	setChartContext()
	setLineContext()

	const id = Math.random().toString(36).substring(7)
	const canvasId = id + '-canvas'

	const lines = getLineContext()

	let ready = false
	let resized = true
	let renderContext = null
	let element: HTMLElement = null
	let canvas: HTMLCanvasElement = null
	let dpr = window.devicePixelRatio
	let cg = null
	let viewport = null
	let yCoords: LinearScale = null
	let labelCoords: CartesianCoordinateSystem = null
	let axisCoords: CartesianCoordinateSystem = null
	let timeCoords: CartesianCoordinateSystem = null
	let font = null
	let fontBold = null

	let clicked = false
	let capture = false

	const xs = []
	for (let i = 0; i < bufferLength; i++) {
		xs[i] = i / timeBase - bufferLength / timeBase
	}
	timeBase = bufferLength / timeBase

	function base10Scale(x: number) {
		let places = 0
		if (Number.isInteger(x)) {
			return 0.1
		} else {
			places = x.toString().split('.')[1].length
		}
		let step = Math.pow(10, places)
		if (x - 1 / step <= 0) {
			step *= 10
		}

		return 1 / step
	}

	function updateCoordinateSystem() {
		if (!ready) return

		const xpad = 80 * dpr
		const xpad2 = 8 * dpr
		const ypad = 60 * dpr

		timeCoords.xscale.range = [xpad, viewport.width - xpad2]
		timeCoords.yscale.range = [ypad, viewport.height - xpad2]

		axisCoords.xscale.range = [xpad, viewport.width - xpad2]
		axisCoords.yscale.range = [ypad, viewport.height - xpad2]

		timeCoords.xscale.domain = [-timeBase * xScale + xOffset * timeBase, 0 + xOffset * timeBase]
		timeCoords.yscale.domain = [-verticalScale * yScale + yOffset * verticalScale, verticalScale * yScale + yOffset * verticalScale]

		axisCoords.xscale.domain = [-timeBase * xScale + xOffset * timeBase, 0 + xOffset * timeBase]
		axisCoords.yscale.domain = [-verticalScale * yScale + yOffset * verticalScale, verticalScale * yScale + yOffset * verticalScale]
	}

	function resize() {
		resized = false

		// Get high DPI value if required
		dpr = window.devicePixelRatio

		// Set the viewport to the parent element's dimensions
		let parent = canvas.parentNode as HTMLElement
		viewport = { x: 0, y: 0, width: parent.clientWidth * dpr, height: parent.clientHeight * dpr }

		// Set the canvas to the parent element's dimensions without DPI adjustment
		canvas.width = parent.clientWidth
		canvas.height = parent.clientHeight

		// Set the CSS dimensions to the parent element's dimensions to constrain it to the actual pixel dimensions
		canvas.style.width = `${canvas.width}px`
		canvas.style.height = `${canvas.height}px`

		// Scale the canvas by the DPI so that we have a 1:1 pixel ratio
		canvas.width *= dpr
		canvas.height *= dpr

		// Update coordinate system with new dimensions
		updateCoordinateSystem()
	}

	function zoom(event) {
		event.preventDefault()
		event.stopImmediatePropagation()
		if (event.ctrlKey) {
			if (event.deltaY > 0) {
				xScale = Math.round((xScale + base10Scale(xScale)) * 1000) / 1000
				xScale = Math.min(xScale, 1)
			} else {
				xScale = Math.round((xScale - base10Scale(xScale)) * 1000) / 1000
				xScale = Math.max(xScale, 0.01)
			}
			return false
		} else {
			if (event.deltaY > 0) {
				yScale *= 2
				// yScale = Math.round((yScale + base10Scale(yScale)) * 1000) / 1000
			} else {
				yScale /= 2
				// yScale = Math.round((yScale - base10Scale(yScale)) * 1000) / 1000
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
		}
	}

	function toggleFullscreen() {
		console.log(element)
		let el = element as HTMLElement
		if (document.fullscreenElement) {
			el.classList.remove('chart-fs')
			document.exitFullscreen()
		} else {
			el.classList.add('chart-fs')
			el.requestFullscreen()
		}
	}

	function captureNextFrame() {
		capture = true
	}

	function saveAsPng() {
		cg.copyTo(viewport, canvas)

		let captureCanvas = document.createElement('canvas')
		captureCanvas.width = viewport.width
		captureCanvas.height = viewport.height
		let captureContext = captureCanvas.getContext('2d')
		captureContext.fillStyle = 'white'
		captureContext.fillRect(0, 0, viewport.width, viewport.height)
		captureContext.drawImage(canvas, 0, 0)

		let link = document.createElement('a')
		link.download = `chart_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`
		link.href = captureCanvas.toDataURL('image/png')
		link.click()
	}

	async function loadFont(name: string): Promise<Font> {
		try {
			const img = new Image()
			img.src = URL.createObjectURL(await fetch(`./${name}.png`).then((res) => res.blob()))
			const config = await fetch(`./${name}.json`).then((res) => res.json())

			return new Font(cg, img, config)
		} catch (e) {
			console.log('Failed to load custom font, loading default font')
			return createDefaultFont(cg)
		}
	}

	function renderAxisAndGrid() {
		let xAxis = new OrthoAxis(cg, axisCoords, 'x', font, {
			labelSide: 1,
			tickOffset: -2.5 * dpr,
			tickLength: 6,
			tickStep: (timeBase / 10) * xScale,
			labelFormatter: (n) => n.toFixed(1),
			labelSize: 12 * dpr,
			axisColor: axisColor,
			tickColor: axisColor,
			labelColor: axisColor
		})

		let yAxis = new OrthoAxis(cg, axisCoords, 'y', font, {
			// axisIntercept: 0,
			// labelAnchor: [-1, 0],
			// labelSide: 1,
			tickOffset: 2.5 * dpr,
			tickLength: 6,
			tickStep: Math.max(Math.round((verticalScale / 5) * yScale * 1000) / 1000, 0.001),
			labelFormatter: (n) => n.toFixed(2),
			labelSize: 12 * dpr,
			axisColor: axisColor,
			tickColor: axisColor,
			labelColor: axisColor
		})

		cg.render(axisCoords, viewport, [xAxis, yAxis])

		xAxis.dispose()
		yAxis.dispose()

		if (grid) {
			let g = new Grid(cg, xAxis.computed.ticks, yAxis.computed.ticks, axisCoords.xscale.domain, axisCoords.yscale.domain, {
				color: [0.875, 0.875, 0.875, 1],
				width: 1 * dpr
			})

			cg.render(axisCoords, viewport, [g])

			g.dispose()
		}
	}

	function renderLabels() {
		let labels = []

		if (xLabel != '') {
			labels.push(
				new Text(cg, fontBold, xLabel, [canvas.width / 2, 8 * dpr], {
					anchor: [0, -1],
					size: 10 * dpr
				})
			)
		}
		if (yLabel != '') {
			labels.push(
				new Text(cg, fontBold, yLabel, [0 * dpr, (canvas.height + 32 * dpr) / 2], {
					anchor: [0, 1],
					angle: Math.PI / 2,
					size: 10 * dpr
				})
			)
		}

		cg.render(labelCoords, viewport, labels)

		labels.forEach((l) => l.dispose())
	}

	function render() {
		if (resized) {
			resize()
		}

		updateCoordinateSystem()

		renderAxisAndGrid()
		renderLabels()

		$lines.forEach((line) => {
			const l = new LineStrip(cg, xs, line.points.toArray(), {
				colors: [line.color.r / 255.0, line.color.g / 255.0, line.color.b / 255.0, line.color.opacity],
				widths: line.width * dpr
			})

			cg.render(timeCoords, viewport, [l])

			l.dispose()
		})

		if (capture) {
			capture = false
			saveAsPng()
		}
		// cg.copyTo(viewport, canvas)

		renderContext = requestAnimationFrame(render)
	}

	onMount(async () => {
		element = document.getElementById(id) as HTMLElement
		canvas = document.getElementById(canvasId) as HTMLCanvasElement
		element.classList.add('bx--tile')

		cg = new CandyGraph({
			alpha: true,
			canvas: canvas
		})
		resize()

		// Create a coordinate system from two linear scales.
		labelCoords = new CartesianCoordinateSystem(cg, new LinearScale([0, canvas.width], [0, canvas.width]), new LinearScale([0, canvas.height], [0, canvas.height]))
		yCoords = new LinearScale([-1, 10], [32 * dpr, viewport.height - 16 * dpr])
		axisCoords = new CartesianCoordinateSystem(cg, new LinearScale([-timeBase, 0], [32 * dpr, viewport.width - 32 * dpr]), yCoords)
		timeCoords = new CartesianCoordinateSystem(cg, new LinearScale([-5, 0], [32 * dpr, viewport.width - 32 * dpr]), yCoords)

		// Load IBM plex font
		font = await loadFont('IBMPlexSans-Regular')
		fontBold = await loadFont('IBMPlexSans-Regular')

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

<Tile {id} {style} class={className}>
	<div class="chart-title">
		<h5>{title}</h5>
		<Button kind="ghost" size="field" class="chart-btn" icon={Download} iconDescription="Save as PNG" on:click={captureNextFrame} />
		<Button kind="ghost" size="field" class="chart-btn" icon={Maximize} iconDescription="Fullscreen" on:click={toggleFullscreen} />
	</div>
	<div class="chart-container">
		<canvas
			id={canvasId}
			on:wheel={zoom}
			on:mousedown={() => (clicked = true)}
			on:mouseup={() => (clicked = false)}
			on:mouseleave={() => (clicked = false)}
			on:mousemove={drag}
		/>
	</div>
</Tile>

<slot />

<style scoped>
	:global(.chart-title) {
		display: flex;
		flex-direction: row;
	}
	:global(.chart-title h5) {
		width: 100%;
	}
	:global(.chart-btn) {
		margin-left: auto;
	}
	:global(.chart-container) {
		width: 100%;
		height: 100%;
	}
	:global(.chart-fs) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100% !important;
		z-index: 1000;
	}
</style>
