<script>
	import { onMount, onDestroy } from 'svelte'
	import {
		Theme,
		Header,
		HeaderGlobalAction,
		HeaderUtilities,
		SideNav,
		SideNavItems,
		SideNavLink,
		SideNavDivider,
		SkipToContent,
		Content,
		Grid,
		Row,
		Column,
		Button,
		ToastNotification
	} from 'carbon-components-svelte'
	import { Activity, WarningAltFilled, DataTable, Fragile, Home, Running, AirportLocation, Ai, TreeView, Analytics, EventChange } from 'carbon-icons-svelte'
	import StopIcon from './assets/stop.svg'
	import StartIcon from './assets/start.svg'

	import { dro } from './lib/store'
	import { storeSetup, storeTeardown, start, stop, nc } from './lib/client'

	import Model from './lib/Model.svelte'
	import Commissioning from './lib/Commissioning.svelte'
	import Teach from './lib/Teach.svelte'
	import ParametersView from './lib/ParametersView.svelte'
	import DynamicsView from './lib/DynamicsView.svelte'
	import HomingView from './lib/HomingView.svelte'
	import EventLogView from './lib/EventLogView.svelte'
	import AnalyticsView from './lib/AnalyticsView.svelte'
	import BehaviourView from './lib/BehaviourView.svelte'

	import { SvelteFlowProvider } from '@xyflow/svelte'

	let view = 0
	let isSideNavOpen = false

	let heartbeat = false
	let heartbeatIndictor = false
	let heartbeatInterval = null
	let controllerDead = false

	let droUnsubscribe = null

	onMount(async () => {
		console.log('App is mounted')

		await storeSetup()

		droUnsubscribe = dro.subscribe(() => {
			heartbeat = true
		})
		heartbeatInterval = setInterval(async () => {
			if (heartbeat) {
				heartbeatIndictor = true
				controllerDead = false
				setTimeout(() => {
					heartbeatIndictor = false
				}, 100)
			} else {
				// heartbeatIndictor = false
				controllerDead = true
			}
			heartbeat = false
		}, 1000)
	})

	onDestroy(async () => {
		droUnsubscribe()
		clearInterval(heartbeatInterval)
		await storeTeardown()
	})
</script>

<Header company="RobotCtrl" platformName="[v4]" bind:isSideNavOpen>
	<svelte:fragment slot="skip-to-content">
		<SkipToContent />
	</svelte:fragment>

	<div class="activity">
		<Activity fill={heartbeatIndictor ? '#42be65' : '#333'} />
	</div>
	<div class="activity">
		<Running fill={$dro.run ? '#42be65' : '#333'} />
	</div>
	<div class="activity">
		<WarningAltFilled fill={$dro.alarm ? '#f01414' : '#333'} />
	</div>
</Header>

<SideNav bind:isOpen={isSideNavOpen} rail>
	<SideNavItems>
		<SideNavLink icon={AirportLocation} text="Commissioning" on:click={() => (view = 0)} isSelected={view == 0} />
		<SideNavLink icon={DataTable} text="System Overview" on:click={() => (view = 1)} isSelected={view == 1} />
		<SideNavLink icon={EventChange} text="Event Log" on:click={() => (view = 7)} isSelected={view == 7} />
		<SideNavLink icon={Analytics} text="Analytics and Scope" on:click={() => (view = 6)} isSelected={view == 6} />
		<SideNavDivider />
		<SideNavLink icon={TreeView} text="Behaviour Planner" on:click={() => (view = 4)} isSelected={view == 4} />
		<SideNavLink icon={Ai} text="Machine Vision" on:click={() => (view = 5)} isSelected={view == 5} />
		<SideNavDivider />
		<SideNavLink icon={Fragile} text="Joint Dynamics" on:click={() => (view = 2)} isSelected={view == 2} />
		<SideNavLink icon={Home} text="Homing" on:click={() => (view = 3)} isSelected={view == 3} />
	</SideNavItems>
</SideNav>

{#if view == 0}
	<Content>
		<Grid fullWidth noGutter>
			<Row>
				<Column sm={4} md={4} lg={7} xlg={5} class="hiddenScroll">
					<h2>Commissioning</h2>
					<Commissioning />

					<h4>Teach Waypoints</h4>
					<Teach />
				</Column>
				<Column sm={3} md={4} lg={9} xlg={11}>
					<Model />
				</Column>
			</Row>
		</Grid>
	</Content>
{:else if view == 1}
	<ParametersView />
{:else if view == 2}
	<DynamicsView />
{:else if view == 3}
	<HomingView />
{:else if view == 4}
	<SvelteFlowProvider>
		<BehaviourView />
	</SvelteFlowProvider>
{:else if view == 5}
	<h2>noop</h2>
{:else if view == 6}
	<AnalyticsView />
{:else if view == 7}
	<EventLogView />
{/if}

<div class="notifications">
	{#if $dro.needsHoming}
		<ToastNotification hideCloseButton kind="info" title="Homing required" subtitle="Please home the robot before starting.">
			<Button slot="caption" kind="primary" size="small" on:click={() => (view = 3)}>Begin Operation</Button>
		</ToastNotification>
	{/if}
	{#if $dro.alarm}
		<ToastNotification hideCloseButton kind="warning-alt" title="Alarm" subtitle="There are pending alarms on the controller, check the event log for more details.">
			<Button slot="caption" kind="primary" size="small" on:click={() => (view = 7)}>View Event Log</Button>
		</ToastNotification>
	{/if}
	{#if controllerDead || nc == null}
		<ToastNotification
			hideCloseButton
			kind="info"
			title="Controller Communication"
			subtitle="No data from the controller has been received. You are either offline or the controller has encountered a critical error and terminated, check the event log for more details."
		>
			<Button slot="caption" kind="primary" size="small" on:click={() => (view = 7)}>View Event Log</Button>
		</ToastNotification>
	{/if}
</div>

<div class="controls">
	<Content>
		<Button kind="danger" on:click={stop}><img class="icon" src={StopIcon} alt="Stop" />Stop</Button>
		<Button kind="primary" on:click={start} disabled={$dro.needsHoming}><img class="icon" src={StartIcon} alt="Start" />Start</Button>
	</Content>
</div>

<Theme theme="g10" tokens={{}} />

<style>
	.activity {
		margin-right: 1rem;
	}
	.icon {
		filter: invert(100%);
		max-width: 16px;
		max-height: 16px;
		margin-top: 1px;
		margin-right: 6px;
	}
	.controls {
		position: fixed;
		z-index: 100000;
		bottom: 0;
		right: 0;
	}
	.notifications {
		position: fixed;
		z-index: 90000;
		top: 4rem;
		right: 1rem;
	}
	:global(.hiddenScroll) {
		max-height: calc(100vh - 8rem);
		overflow: scroll;
	}
	:global(.hiddenScroll::-webkit-scrollbar) {
		display: none;
	}
</style>
