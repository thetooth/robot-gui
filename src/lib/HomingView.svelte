<script>
	import { dro } from './store'
	import { home, reset } from './client'
	import { Content, Grid, Row, Column, OrderedList, ListItem, Button } from 'carbon-components-svelte'
	import ISOWarning from '../assets/ISO_7010_W024.svg'
	import TopView from '../assets/scara_bot_rev5_topview.png'

	let jointsSet = false

	function setJointAngles() {
		reset()
		jointsSet = true
	}
</script>

<Content>
	<h2>Axis Homing</h2>

	<Grid fullWidth>
		<Row>
			<Column>
				<OrderedList>
					<ListItem>
						<p>Push Emergency Stop button and check for obstructions.</p>
						<Grid fullWidth noGutter>
							<Row>
								<Column sm={1} md={1} lg={1}>
									<img src={ISOWarning} alt="Warning" width="100%" />
								</Column>
								<Column sm={15} md={7} lg={15}>
									<h5>Warning</h5>
									<p>Before proceeding, remember not to do dumb shit.</p>
								</Column>
							</Row>
						</Grid>
						<br />
					</ListItem>
					<ListItem>
						<p>Set the J1 and J2 joint angles to opposing 45 degree angles before proceeding.</p>
						<p><img src={TopView} alt="SCARA Robot top down view" width="500px" /></p>
						<p><Button kind="primary" size="field" on:click={setJointAngles} disabled={$dro.run}>Proceed</Button></p>
					</ListItem>
					{#if jointsSet}
						<ListItem><p>Reset Emergency Stop button.</p></ListItem>
						<ListItem>
							<p>The controller is now ready for automated homing.</p>
							<p>J1 and J2 will retract towards the base of the machine until the limit switches are triggered.</p>
						</ListItem>
						<ListItem>
							<p>Press "Home" button to begin homing.</p>
							<p><Button kind="danger-tertiary" size="field" on:click={home} disabled={!$dro.needsHoming}>Begin Homing</Button></p>
						</ListItem>
						{#if !$dro.needsHoming}
							<ListItem><p>Axis homing is complete.</p></ListItem>
						{/if}
					{/if}
				</OrderedList>
			</Column>
		</Row>
	</Grid>
</Content>
