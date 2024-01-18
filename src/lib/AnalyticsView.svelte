<script lang="ts">
	import { dro } from '../store'
	import { Chart, Line } from './components/chart'
	import { CircularBuffer } from 'cirbuf'

	import { Content, Select, SelectItem, Grid, Row, Column } from 'carbon-components-svelte'
	import { onDestroy, onMount } from 'svelte'

	let selected = 'ethercat'

	let size = 10_000
	let sync0 = new CircularBuffer<number>(size)
	let compensation = new CircularBuffer(size)
	let integral = new CircularBuffer(size)

	let colors = new Map()
	colors.set('red', 'da1e28')
	colors.set('green', '198038')
	colors.set('blue', '0043ce')
	colors.set('yellow', 'f1c21b')

	let forward = {
		x: new CircularBuffer(size),
		y: new CircularBuffer(size),
		z: new CircularBuffer(size),
		r: new CircularBuffer(size)
	}

	const droUnsubscribe = dro.subscribe((data) => {
		sync0.push(data.ethercat.sync0 / 1000)
		compensation.push(data.ethercat.compensation / 1000)
		integral.push(data.ethercat.integral / 200)

		forward.x.push(data.pose.x)
		forward.y.push(data.pose.y)
		forward.z.push(data.pose.z)
		forward.r.push(data.pose.r)
	})
	onDestroy(async () => {
		droUnsubscribe()
		console.log('AnalyticsView is destroyed')
	})
</script>

<Content>
	<h2>Analytics</h2>

	<p>
		<Select labelText="Chart Layout" bind:selected>
			<SelectItem value="ethercat" text="EtherCAT timing" />
			<SelectItem value="forward" text="Axis Forward Kinematics" />
		</Select>
	</p>

	{#if selected === 'ethercat'}
		<h4>EtherCAT Timing Compensation</h4>
		<Grid fullWidth noGutter>
			<Row>
				<Column>
					<h5>Sync Point</h5>
					<Chart timeBase={size} verticalScale={75} style="height:18rem">
						<Line color={colors.get('green')} points={sync0} />
					</Chart>
				</Column>
				<Column>
					<h5>Integral</h5>
					<Chart timeBase={size} verticalScale={2} style="height:18rem">
						<Line color={colors.get('blue')} points={integral} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column>
					<h5>Compensation</h5>
					<Chart timeBase={size} verticalScale={0.1} style="height:18rem">
						<Line color={colors.get('red')} points={compensation} />
					</Chart>
				</Column>
				<Column></Column>
			</Row>
		</Grid>
	{:else if selected === 'forward'}
		<h4>Forward Kinematic Position</h4>
		<Grid fullWidth noGutter>
			<Row>
				<Column>
					<h5>X</h5>
					<Chart timeBase={size} verticalScale={400} style="height:18rem">
						<Line color={colors.get('red')} points={forward.x} />
					</Chart>
				</Column>
				<Column>
					<h5>Z</h5>
					<Chart timeBase={size} verticalScale={150} style="height:18rem">
						<Line color={colors.get('blue')} points={forward.z} />
					</Chart>
				</Column>
			</Row>
			<Row>
				<Column>
					<h5>Y</h5>
					<Chart timeBase={size} verticalScale={400} style="height:18rem">
						<Line color={colors.get('green')} points={forward.y} />
					</Chart>
				</Column>
				<Column>
					<h5>R</h5>
					<Chart timeBase={size} verticalScale={360} style="height:18rem">
						<Line color={colors.get('yellow')} points={forward.r} />
					</Chart>
				</Column>
			</Row>
		</Grid>
	{/if}
</Content>
