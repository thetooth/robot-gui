<script lang="ts">
	import { dro } from './store'
	import { Chart, Line } from './components/chart'
	import { CircularBuffer } from 'cirbuf'

	import { Content, Select, SelectItem, Grid, Row, Column, FormGroup, Toggle } from 'carbon-components-svelte'
	import { onDestroy, onMount } from 'svelte'
	import { label } from 'three/examples/jsm/nodes/Nodes.js'

	let selected = 'ethercat'

	let play: boolean = true
	let timeBase: number = 250
	let bufferLength: number = 10 * 250
	let xScale: number = 1
	let yScale: number = 1
	let yOffset: number = 0

	let colors = new Map()
	colors.set('red', '#da1e28')
	colors.set('green', '#198038')
	colors.set('blue', '#0043ce')
	colors.set('yellow', '#f1c21b')
	let width = 2

	let sync0 = new CircularBuffer<number>(bufferLength)
	let compensation = new CircularBuffer(bufferLength)
	let integral = new CircularBuffer(bufferLength)
	let forward = {
		x: new CircularBuffer(bufferLength),
		y: new CircularBuffer(bufferLength),
		z: new CircularBuffer(bufferLength),
		r: new CircularBuffer(bufferLength)
	}
	let torque = [new CircularBuffer(bufferLength), new CircularBuffer(bufferLength), new CircularBuffer(bufferLength), new CircularBuffer(bufferLength)]

	const droUnsubscribe = dro.subscribe((data) => {
		if (!play) return

		sync0.push(data.ethercat.sync0 / 1000)
		compensation.push(data.ethercat.compensation / 1000)
		integral.push(data.ethercat.integral / 200)

		forward.x.push(data.pose.x)
		forward.y.push(data.pose.y)
		forward.z.push(data.pose.z)
		forward.r.push(data.pose.r)

		data.drives.forEach((drive, i) => {
			torque[i].push(drive.actualTorque)
		})
	})
	onDestroy(async () => {
		droUnsubscribe()
		console.log('AnalyticsView is destroyed')
	})
</script>

<Content>
	<h2>Analytics</h2>

	<p>
		<FormGroup>
			<Select labelText="Chart Layout" bind:selected>
				<SelectItem value="ethercat" text="EtherCAT timing" />
				<SelectItem value="forward" text="Axis Forward Kinematics" />
				<SelectItem value="torque" text="Drive Torque" />
			</Select>
			<Select labelText="Chart Size" bind:selected={xScale}>
				<SelectItem value={0.01} text="100ms" />
				<SelectItem value={0.05} text="500ms" />
				<SelectItem value={0.1} text="1s" />
				<SelectItem value={0.5} text="5s" />
				<SelectItem value={1} text="10s" />
			</Select>
			<Toggle labelText="Pause" bind:toggled={play} />
		</FormGroup>
	</p>

	{#if selected === 'ethercat'}
		<h4>EtherCAT Timing Compensation</h4>
		<Grid fullWidth noGutter>
			<Row>
				<Column lg={8}>
					<h5>Sync Point</h5>
					<Chart {timeBase} {bufferLength} verticalScale={10} yLabel="uS" bind:xScale yOffset={5} class="chart">
						<Line color={colors.get('green')} {width} points={sync0} />
					</Chart>
				</Column>
				<Column lg={8}>
					<h5>Integral</h5>
					<Chart {timeBase} {bufferLength} verticalScale={10} yLabel="uS" bind:xScale class="chart">
						<Line color={colors.get('blue')} {width} points={integral} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column lg={8}>
					<h5>Compensation</h5>
					<Chart {timeBase} {bufferLength} verticalScale={0.1} yLabel="uS" bind:xScale class="chart">
						<Line color={colors.get('red')} {width} points={compensation} />
					</Chart>
				</Column>
				<Column></Column>
			</Row>
		</Grid>
	{:else if selected === 'forward'}
		<h4>Forward Kinematic Position</h4>
		<Grid fullWidth noGutter>
			<Row>
				<Column lg={8}>
					<h5>X</h5>
					<Chart {timeBase} {bufferLength} verticalScale={400} yLabel="mm" bind:xScale class="chart">
						<Line color={colors.get('red')} {width} points={forward.x} />
					</Chart>
				</Column>
				<Column lg={8}>
					<h5>Z</h5>
					<Chart {timeBase} {bufferLength} verticalScale={150} yLabel="mm" bind:xScale class="chart">
						<Line color={colors.get('blue')} {width} points={forward.z} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column lg={8}>
					<h5>Y</h5>
					<Chart {timeBase} {bufferLength} verticalScale={400} yLabel="mm" bind:xScale class="chart">
						<Line color={colors.get('green')} {width} points={forward.y} />
					</Chart>
				</Column>
				<Column lg={8}>
					<h5>R</h5>
					<Chart {timeBase} {bufferLength} verticalScale={360} yLabel="degrees" bind:xScale class="chart">
						<Line color={colors.get('yellow')} {width} points={forward.r} />
					</Chart>
				</Column>
			</Row>
		</Grid>
	{:else if selected === 'torque'}
		<h4>Drive Torque</h4>
		<Grid fullWidth noGutter>
			<Row>
				<Column>
					<h5>X</h5>
					<Chart {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('red')} {width} points={torque[0]} />
					</Chart>
				</Column>
				<Column>
					<h5>Z</h5>
					<Chart {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('blue')} {width} points={torque[2]} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column>
					<h5>Y</h5>
					<Chart {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('green')} {width} points={torque[1]} />
					</Chart>
				</Column>
				<Column>
					<h5>R</h5>
					<Chart {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('yellow')} {width} points={torque[3]} />
					</Chart>
				</Column>
			</Row>
		</Grid>
	{/if}
</Content>

<style>
	:global(.chart) {
		height: 13rem;
	}
</style>
