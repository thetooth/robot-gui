<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { dro, events, ethercatStatusTable } from './store'
	import { reset, hotStart } from './client'

	import { Grid, Row, Column, Content, FormGroup, Button, Tile } from 'carbon-components-svelte'

	import { InfluxDB, Point } from '@influxdata/influxdb-client'
	import { InformationFilled, WarningAltFilled, ErrorFilled, Debug, CriticalSeverity, Asset, Repeat } from 'carbon-icons-svelte'
	import { ChartTheme, GaugeChart, type GaugeChartOptions } from '@carbon/charts-svelte'

	const queryApi = new InfluxDB({
		url: 'http://localhost:8086',
		token: 'SJxK3DsmSw7ZLkXUZO7J2Cuq2KKKj7BMHAiVKfq3OexG-p_K7ENBMDpDJRRw6lJYmsrQ-z8pmEbull7yoBlEPQ=='
	}).getQueryApi('Robot')

	let driveOpts: GaugeChartOptions = {
		title: 'Drive Torque',
		resizable: true,
		height: '150px',
		width: '100%',
		gauge: {
			type: 'semi'
		},
		toolbar: {
			enabled: false
		},
		theme: ChartTheme.WHITE
	}

	let pose = []
	async function getPose() {
		const query = `from(bucket: "robot")
			|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
			|> filter(fn: (r) => r["_measurement"] == "pose")
			|> filter(fn: (r) => r["_field"] == "x" or r["_field"] == "y" or r["_field"] == "z" or r["_field"] == "r")
			|> aggregateWindow(every: v.windowPeriod, fn: mean, createEmpty: false)
			|> yield(name: "mean")`

		queryApi.queryRows(query, {
			next(row, tableMeta) {
				const result = tableMeta.toObject(row)
				pose = {
					x: result._field === 'x' ? result._value : pose.x,
					y: result._field === 'y' ? result._value : pose.y,
					z: result._field === 'z' ? result._value : pose.z,
					r: result._field === 'r' ? result._value : pose.r
				}
			},
			error(error) {
				console.error(error)
			},
			complete() {
				console.log('Query complete')
			}
		})
	}

	let drives = []
	async function getTorque() {
		// const query = `import "math"
		// from(bucket: "robot")
		// 	|> range(start: -1s)
		// 	|> filter(fn: (r) => r["_measurement"] == "drive")
		// 	|> filter(fn: (r) => r["_field"] == "actualTorque")
		// 	|> map(fn: (r) => ({r with _value: math.abs(x: r._value)}))
		// 	|> group(columns: ["_measurement", "_field", "slaveID"])
		// 	|> mean()`

		// queryApi.queryRows(query, {
		// 	next(row, tableMeta) {
		// 		const result = tableMeta.toObject(row)
		// 		drives[result.slaveID - 1] = [
		// 			{
		// 				group: 'value',
		// 				value: result._value
		// 			}
		// 		]

		// 		drives = [...drives]
		// 		console.log(result)
		// 	},
		// 	error(error) {
		// 		console.error(error)
		// 	},
		// 	complete() {
		// 		console.log('Query complete')
		// 	}
		// })
		$dro.drives.forEach((drive, index) => {
			drives[index] = [
				{
					group: 'value',
					value: Math.round(Math.abs(drive.actualTorque))
				}
			]
		})
	}

	let torqueInterval: number

	onMount(async () => {
		console.log('Parameters UI is mounted')
		setInterval(getTorque, 10)
	})
	onDestroy(() => {
		console.log('Parameters UI is destroyed')
		clearInterval(torqueInterval)
	})
</script>

<Content>
	<h2>System Overview</h2>
	<Grid fullWidth noGutter padding>
		<Row>
			<Column>
				<Tile>
					<h5>Fieldbus</h5>
					<Grid>
						<Row>
							<Column>
								<label for="status">Status</label>
								<h3>{ethercatStatusTable.get($dro.ethercat.state)}</h3>
							</Column>
							<Column>
								<label for="sync0">Sync0</label>
								<h3>{($dro.ethercat.sync0 / 1000.0).toFixed(2)}us</h3>
							</Column>
						</Row>
					</Grid>
				</Tile>
			</Column>
			<Column lg={12}>
				<Tile>
					<h5>System</h5>
					<Grid>
						<Row>
							<Column>
								<label for="state">State</label>
								<h3>{$dro.state}</h3>
							</Column>
							<Column>
								<label for="running">Running</label>
								<h3>{$dro.run ? 'Yes' : 'No'}</h3>
							</Column>
							<Column>
								<label for="alarm">Alarm</label>
								<h3>{$dro.alarm ? 'Yes' : 'No'}</h3>
							</Column>
							<Column>
								<label for="homing">Homing complete</label>
								<h3>{!$dro.needsHoming ? 'Yes' : 'No'}</h3>
							</Column>
							<Column>
								<label for="runtime">Uptime</label>
								<h3>{new Date($dro.runtimeDuration * 1000).toISOString().substring(11, 19)}</h3>
							</Column>
							<Column>
								<label for="power">Power On Duration</label>
								<h3>{new Date($dro.powerOnDuration * 1000).toISOString().substring(11, 19)}</h3>
							</Column>
						</Row>
					</Grid>
				</Tile>
			</Column>
		</Row>
		<Row>
			<Column lg={4}>
				<Tile>
					<h5>Alerts</h5>
					<Grid>
						<Row>
							<Column>
								<label for="critical">Critical</label>
								<h3>
									<CriticalSeverity size={20} color="var(--cds-support-error)" />
									{$events.filter((p) => p.level === 'critical' || p.level === 'error').reduce((acc, p) => acc + 1, 0)}
								</h3>
							</Column>
							<Column>
								<label for="error">Error</label>
								<h3>
									<ErrorFilled size={20} color="var(--cds-support-error)" />
									{$events.filter((p) => p.level === 'error').reduce((acc, p) => acc + 1, 0)}
								</h3>
							</Column>
							<Column>
								<label for="warning">Warning</label>
								<h3>
									<WarningAltFilled size={20} color="var(--cds-support-warning)" />
									{$events.filter((p) => p.level === 'warning').reduce((acc, p) => acc + 1, 0)}
								</h3>
							</Column>
						</Row>
					</Grid>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>Controller</h5>
					<FormGroup>
						<Button kind="danger-tertiary" on:click={reset}>Force Reset</Button>
						<Button kind="danger-tertiary" on:click={hotStart}>Force Hot Start</Button>
					</FormGroup>
				</Tile>
			</Column>
		</Row>
		<Row>
			<Column>
				<Tile>
					<h5>X</h5>
					<label for="position">Position</label>
					<h4>{$dro.pose.x.toFixed(3)}mm</h4>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>Y</h5>
					<label for="position">Position</label>
					<h4>{$dro.pose.y.toFixed(3)}mm</h4>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>Z</h5>
					<label for="position">Position</label>
					<h4>{$dro.pose.z.toFixed(3)}mm</h4>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>R</h5>
					<label for="position">Position</label>
					<h4>{$dro.pose.r.toFixed(3)}&deg;</h4>
				</Tile>
			</Column>
		</Row>
		<Row>
			<Column>
				<Tile>
					<h5>Alpha</h5>
					<label for="angle">Angle</label>
					<h4>{$dro.pose.alpha.toFixed(3)}&deg;</h4>
					<label for="alpha-velocity">Alpha Velocity</label>
					<h4>{$dro.pose.alphaVelocity.toFixed(3)}&deg;/s</h4>
					<label for="rpm">Drive RPM</label>
					<h4>{(($dro.pose.alphaVelocity * 50) / 6).toFixed(1)}</h4>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>Beta</h5>
					<label for="angle">Angle</label>
					<h4>{$dro.pose.beta.toFixed(3)}&deg;</h4>
					<label for="beta-velocity">Beta Velocity</label>
					<h4>{$dro.pose.betaVelocity.toFixed(3)}&deg;/s</h4>
					<label for="rpm">Drive RPM</label>
					<h4>{(($dro.pose.betaVelocity * 50) / 6).toFixed(1)}</h4>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>Theta</h5>
					<label for="angle">Angle</label>
					<h4>{$dro.pose.theta.toFixed(3)}&deg;</h4>
					<label for="theta-velocity">Theta Velocity</label>
					<h4>{$dro.pose.thetaVelocity.toFixed(3)}&deg;/s</h4>
					<label for="rpm">Drive RPM</label>
					<h4>{($dro.pose.thetaVelocity / 6).toFixed(1)}</h4>
				</Tile>
			</Column>
			<Column>
				<Tile>
					<h5>Phi</h5>
					<label for="angle">Angle</label>
					<h4>{$dro.pose.phi.toFixed(3)}&deg;</h4>
					<label for="phi-velocity">Phi Velocity</label>
					<h4>{$dro.pose.phiVelocity.toFixed(3)}&deg;/s</h4>
					<label for="rpm">Drive RPM</label>
					<h4>{($dro.pose.phiVelocity / 6).toFixed(1)}</h4>
				</Tile>
			</Column>
		</Row>
		<Row>
			{#each drives as drive, i}
				<Column>
					<Tile>
						<h5>Drive {i + 1}</h5>
						<!-- <GaugeChart data={drive} options={{ ...driveOpts, title: 'Torque' }} /> -->
						<label for="controlword">Control Word</label>
						<h4>0x{$dro.drives[i].controlWord.toString(16).padStart(4, '0')}</h4>
						<label for="statusword">Status Word</label>
						<h4>0x{$dro.drives[i].statusWord.toString(16).padStart(4, '0')}</h4>
						<label for="errorcode">Error Code</label>
						<h4>0x{$dro.drives[i].errorCode.toString(16).padStart(4, '0')}</h4>
						<label for="fault">Fault</label>
						<h4>{$dro.drives[i].fault ? 'Yes' : 'No'}</h4>
						<label for="faultmessage">Fault Message</label>
						<h4>{$dro.drives[i].lastFault}</h4>
						<label for="deviation">Deviation</label>
						<h4>{$dro.drives[i].followingError.toFixed(3)}&deg;</h4>
						<label for="torque">Torque</label>
						<h4>{$dro.drives[i].actualTorque.toFixed(1)}%</h4>
					</Tile>
				</Column>
			{/each}
		</Row>
	</Grid>
</Content>

<style global>
	:global(.drive-fault) {
		background-color: #f01414;
	}
</style>
