<script>
	import { onMount, onDestroy } from 'svelte'
	import { dro, reset, hotStart, otgStatusTable, kinematicStatusTable } from '../store'

	import { Grid, Row, Column, Content, FormGroup, Button } from 'carbon-components-svelte'

	onMount(async () => {
		console.log('Parameters UI is mounted')
	})
</script>

<Content>
	<h2>System Overview</h2>
	<h4>Kinematics</h4>
	<Grid fullWidth noGutter padding>
		<Row>
			<Column lg={1}>X</Column>
			<Column lg={6}>{$dro.pose.x.toFixed(3)}mm</Column>
			<Column lg={1}>Z</Column>
			<Column lg={6}>{$dro.pose.z.toFixed(3)}mm</Column>
		</Row>
		<Row>
			<Column lg={1}>Y</Column>
			<Column lg={6}>{$dro.pose.y.toFixed(3)}mm</Column>
			<Column lg={1}>R</Column>
			<Column lg={6}>{$dro.pose.r.toFixed(3)}&deg;</Column>
		</Row>
	</Grid>

	<Grid fullWidth noGutter padding>
		<Row>
			<Column lg={1}>Alpha</Column>
			<Column lg={3}>{$dro.pose.alpha.toFixed(3)}&deg;</Column>
			<Column lg={3}>{$dro.pose.alphaVelocity.toFixed(3)}&deg;/s</Column>
			<Column lg={1}>Phi</Column>
			<Column lg={3}>{$dro.pose.phi.toFixed(3)}&deg;</Column>
			<Column lg={3}>{$dro.pose.phiVelocity.toFixed(3)}&deg;/s</Column>
		</Row>
		<Row>
			<Column lg={1}>Beta</Column>
			<Column lg={3}>{$dro.pose.beta.toFixed(3)}&deg;</Column>
			<Column lg={3}>{$dro.pose.betaVelocity.toFixed(3)}&deg;/s</Column>
			<Column lg={1}>Theta</Column>
			<Column lg={3}>{$dro.pose.theta.toFixed(3)}&deg;</Column>
			<Column lg={3}>{$dro.pose.thetaVelocity.toFixed(3)}&deg;/s</Column>
		</Row>
	</Grid>

	<h4>Controller</h4>
	<Grid fullWidth noGutter padding>
		<Row>
			<Column>State</Column>
			<Column>{$dro.state}</Column>
			<Column>Running</Column>
			<Column>{$dro.run ? 'Yes' : 'No'}</Column>
			<Column>Alarm</Column>
			<Column>{$dro.alarm ? 'Yes' : 'No'}</Column>
			<Column>Homing complete</Column>
			<Column>{!$dro.needsHoming ? 'Yes' : 'No'}</Column>
		</Row>
	</Grid>

	<FormGroup>
		<Button kind="danger-tertiary" size="small" on:click={reset}>Force Reset</Button>
		<Button kind="danger-tertiary" size="small" on:click={hotStart}>Force Hot Start</Button>
	</FormGroup>

	<h4>Online Trajectory Generation</h4>
	<p>{otgStatusTable.get($dro.otg.result)}</p>
	<p>{kinematicStatusTable.get($dro.otg.kinematicResult)}</p>

	<h4>EtherCAT</h4>
	<Grid fullWidth noGutter padding>
		<Row>
			<Column lg={1}>Sync0</Column>
			<Column lg={1}>{$dro.ethercat.sync0 / 1000.0}us</Column>
			<Column lg={1}>P</Column>
			<Column lg={1}>{$dro.ethercat.compensation / 1000.0}us</Column>
			<Column lg={1}>I</Column>
			<Column lg={1}>{$dro.ethercat.integral}</Column>
		</Row>
	</Grid>

	<h4>Drives</h4>
	<Grid fullWidth noGutter padding>
		<Row>
			<Column lg={1}>Joint</Column>
			<Column lg={2}>Control Word</Column>
			<Column lg={2}>Status Word</Column>
			<Column lg={2}>Error Code</Column>
			<Column lg={5}>Fault Message</Column>
			<Column lg={2}>Deviation</Column>
			<Column lg={2}>Torque</Column>
		</Row>
		{#each $dro.drives as drive}
			<Row class={drive.fault ? 'drive-fault' : ''}>
				<Column lg={1}>J{drive.slaveID}</Column>
				<Column lg={2}>0x{drive.controlWord.toString(16).padStart(4, '0')}</Column>
				<Column lg={2}>0x{drive.statusWord.toString(16).padStart(4, '0')}</Column>
				<Column lg={2}>0x{drive.errorCode.toString(16).padStart(4, '0')}</Column>
				<Column lg={5}>{drive.lastFault}</Column>
				<Column lg={2}>{drive.followingError.toFixed(3)}&deg;</Column>
				<Column lg={2}>{drive.actualTorque.toFixed(1)}%</Column>
			</Row>
		{/each}
	</Grid>
</Content>

<style global>
	:global(.drive-fault) {
		background-color: #f01414;
	}
</style>
