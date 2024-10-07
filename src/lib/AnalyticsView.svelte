<script lang="ts">
	import { dro, selectedAnalyticsView } from './store'
	import { Chart, Line } from './components/chart'
	import { CircularBuffer } from 'cirbuf'

	import { Content, Select, SelectItem, Grid, Row, Column, Form, FormGroup, Toggle } from 'carbon-components-svelte'
	import { onDestroy, onMount } from 'svelte'

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
	colors.set('gray', '#5a6872')
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
	interface Drive {
		actualTorque: CircularBuffer<number>
		deviation: CircularBuffer<number>
	}
	let torque: Drive[] = [
		{ actualTorque: new CircularBuffer(bufferLength), deviation: new CircularBuffer(bufferLength) },
		{ actualTorque: new CircularBuffer(bufferLength), deviation: new CircularBuffer(bufferLength) },
		{ actualTorque: new CircularBuffer(bufferLength), deviation: new CircularBuffer(bufferLength) },
		{ actualTorque: new CircularBuffer(bufferLength), deviation: new CircularBuffer(bufferLength) }
	]

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
			torque[i].actualTorque.push(drive.actualTorque)
			torque[i].deviation.push(drive.followingError)
		})
	})
	onDestroy(async () => {
		droUnsubscribe()
		console.log('AnalyticsView is destroyed')
	})
</script>

<Content>
	<h2>Analytics</h2>
	<Grid fullWidth noGutter>
		<Row>
			<Column lg={3}>
				<Select labelText="Chart Layout" bind:selected={$selectedAnalyticsView} inline>
					<SelectItem value="ethercat" text="EtherCAT timing" />
					<SelectItem value="forward" text="Axis Forward Kinematics" />
					<SelectItem value="torque" text="Torque vs Following Error" />
				</Select>
			</Column>
			<Column lg={2}>
				<Select labelText="Chart Size" bind:selected={xScale} inline>
					<SelectItem value={0.01} text="100ms" />
					<SelectItem value={0.05} text="500ms" />
					<SelectItem value={0.1} text="1s" />
					<SelectItem value={0.5} text="5s" />
					<SelectItem value={1} text="10s" />
				</Select>
			</Column>
			<Column>
				<Toggle bind:toggled={play} size="sm" />
			</Column>
		</Row>
	</Grid>

	{#if $selectedAnalyticsView === 'ethercat'}
		<h4>EtherCAT Timing Compensation</h4>
		<Grid fullWidth noGutter padding>
			<Row>
				<Column lg={8}>
					<Chart title="Sync Point" {timeBase} {bufferLength} verticalScale={100} yLabel="uS" bind:xScale yOffset={5} class="chart">
						<Line color={colors.get('green')} {width} points={sync0} />
					</Chart>
				</Column>
				<Column lg={8}>
					<Chart title="Integral" {timeBase} {bufferLength} verticalScale={10} yLabel="uS" bind:xScale class="chart">
						<Line color={colors.get('blue')} {width} points={integral} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column lg={8}>
					<Chart title="Compensation" {timeBase} {bufferLength} verticalScale={1} yLabel="uS" bind:xScale class="chart">
						<Line color={colors.get('red')} {width} points={compensation} />
					</Chart>
				</Column>
				<Column></Column>
			</Row>
		</Grid>
	{:else if $selectedAnalyticsView === 'forward'}
		<h4>Forward Kinematic Position</h4>
		<Grid fullWidth noGutter padding>
			<Row>
				<Column lg={8}>
					<Chart title="X" {timeBase} {bufferLength} verticalScale={400} yLabel="mm" bind:xScale class="chart">
						<Line color={colors.get('red')} {width} points={forward.x} />
					</Chart>
				</Column>
				<Column lg={8}>
					<Chart title="Z" {timeBase} {bufferLength} verticalScale={150} yLabel="mm" bind:xScale class="chart">
						<Line color={colors.get('blue')} {width} points={forward.z} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column lg={8}>
					<Chart title="Y" {timeBase} {bufferLength} verticalScale={400} yLabel="mm" bind:xScale class="chart">
						<Line color={colors.get('green')} {width} points={forward.y} />
					</Chart>
				</Column>
				<Column lg={8}>
					<Chart title="R" {timeBase} {bufferLength} verticalScale={360} yLabel="degrees" bind:xScale class="chart">
						<Line color={colors.get('yellow')} {width} points={forward.r} />
					</Chart>
				</Column>
			</Row>
		</Grid>
	{:else if $selectedAnalyticsView === 'torque'}
		<h4>Torque vs Following Error</h4>
		<Grid fullWidth noGutter padding>
			<Row>
				<Column lg={8}>
					<Chart title="X" {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('red')} {width} points={torque[0].actualTorque} />
						<Line color={colors.get('gray')} {width} points={torque[0].deviation} />
					</Chart>
				</Column>
				<Column lg={8}>
					<Chart title="Z" {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('blue')} {width} points={torque[2].actualTorque} />
						<Line color={colors.get('gray')} {width} points={torque[2].deviation} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column lg={8}>
					<Chart title="Y" {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('green')} {width} points={torque[1].actualTorque} />
						<Line color={colors.get('gray')} {width} points={torque[1].deviation} />
					</Chart>
				</Column>
				<Column lg={8}>
					<Chart title="R" {timeBase} {bufferLength} verticalScale={100} bind:xScale bind:yScale bind:yOffset class="chart">
						<Line color={colors.get('yellow')} {width} points={torque[3].actualTorque} />
						<Line color={colors.get('gray')} {width} points={torque[3].deviation} />
					</Chart>
				</Column>
			</Row>
		</Grid>
	{/if}
</Content>

<style>
	:global(.chart) {
		height: 18rem;
	}
</style>
