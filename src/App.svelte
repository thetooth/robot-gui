<script>
	import { onMount, onDestroy } from 'svelte'
	import {
		Theme,
		Loading,
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
	import { link, location } from 'svelte-spa-router'
	import Router from 'svelte-spa-router'
	import { Activity, WarningAltFilled, DataTable, Fragile, Home, Running, AirportLocation, Ai, TreeView, Analytics, EventChange } from 'carbon-icons-svelte'
	import StopIcon from './assets/stop.svg'
	import StartIcon from './assets/start.svg'

	import { dro } from './lib/store'
	import { storeSetup, storeTeardown, start, stop, nc, ready } from './lib/client'

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

	let isSideNavOpen = false

	let heartbeat = false
	let heartbeatIndictor = false
	let heartbeatInterval = null
	let controllerDead = false

	let droUnsubscribe = null

	let routes = {
		'/': ParametersView,
		'/commissioning': Commissioning,
		'/dynamics': DynamicsView,
		'/homing': HomingView,
		'/events': EventLogView,
		'/analytics': AnalyticsView,
		'/behaviour': BehaviourView
	}

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

<Header company="RobotCtrl" platformName="[v4]" bind:isSideNavOpen href="#/">
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
		<SideNavLink icon={DataTable} text="System Overview" href="#/" isSelected={$location === '/'} />
		<SideNavLink icon={EventChange} text="Event Log" href="#/events" isSelected={$location === '/events'} />
		<SideNavLink icon={Analytics} text="Analytics and Scope" href="#/analytics" isSelected={$location === '/analytics'} />
		<SideNavDivider />
		<SideNavLink icon={AirportLocation} text="Commissioning" href="#/commissioning" isSelected={$location === '/commissioning'} />
		<SideNavLink icon={TreeView} text="Behaviour Planner" href="#/behaviour" isSelected={$location === '/behaviour'} />
		<SideNavLink icon={Ai} text="Machine Vision" href="#/ai" isSelected={$location === '/ai'} />
		<SideNavDivider />
		<SideNavLink icon={Fragile} text="Joint Dynamics" href="#/dynamics" isSelected={$location === '/dynamics'} />
		<SideNavLink icon={Home} text="Homing" href="#/homing" isSelected={$location === '/homing'} />
	</SideNavItems>
</SideNav>

{#if $ready}
	<SvelteFlowProvider>
		<Router {routes} />
	</SvelteFlowProvider>
{:else}
	<Loading />
{/if}

<div class="notifications">
	{#if $dro.needsHoming}
		<ToastNotification hideCloseButton kind="info" title="Homing required" subtitle="Please home the robot before starting.">
			<Button slot="caption" kind="primary" size="small" href="#/homing">Begin Operation</Button>
		</ToastNotification>
	{/if}
	{#if $dro.alarm}
		<ToastNotification hideCloseButton kind="warning-alt" title="Alarm" subtitle="There are pending alarms on the controller, check the event log for more details.">
			<Button slot="caption" kind="primary" size="small" href="#/events">View Event Log</Button>
		</ToastNotification>
	{/if}
	{#if controllerDead || !$ready}
		<ToastNotification
			hideCloseButton
			kind="info"
			title="Controller Communication"
			subtitle="No data from the controller has been received. You are either offline or the controller has encountered a critical error and terminated, check the event log for more details."
		>
			<Button slot="caption" kind="primary" size="small" href="#/events" disabled={!$ready}>View Event Log</Button>
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
