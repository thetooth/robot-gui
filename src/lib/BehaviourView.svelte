<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { dro } from './store'
	import {
		setup,
		behaviour,
		localRev,
		serverRev,
		nodes,
		edges,
		behaviourStatus,
		nodeMapping,
		layoutNodes,
		calculateNodeSizes,
		newNodes,
		newEdges,
		save,
		start,
		stop,
		reset,
		teardown,
		deploy
	} from './components/behaviour'
	import { SvelteFlow, useSvelteFlow, Background, MiniMap, Panel, type Node, type Edge, type SnapGrid, ConnectionLineType, type Connection } from '@xyflow/svelte'

	import { Content, Grid, Row, Column, Form, FormGroup, Button, TextInput, TextArea, InlineNotification } from 'carbon-components-svelte'
	import { Movement, Recording, Stop, Play, Reset, Save, Unsaved, Document, Folder, Deploy } from 'carbon-icons-svelte'
	import { Connect } from 'carbon-pictograms-svelte'

	import '@xyflow/svelte/dist/style.css'
	import './components/behaviour/style.css'

	import Model from './Model.svelte'
	import ContextMenu from './components/behaviour/ContextMenu.svelte'
	import OpenModal from './components/behaviour/OpenModal.svelte'
	import NodeParameters from './components/behaviour/NodeParameters.svelte'

	const snapGrid: SnapGrid = [20, 20]

	const { fitView } = useSvelteFlow()

	let flow: HTMLElement
	let ctxMenu: ContextMenu
	let ctxOpen: OpenModal
	let selectedNode: Node
	let changed: boolean = false
	let inSync: boolean = false

	async function layout() {
		nodes.set(calculateNodeSizes($nodes))

		await layoutNodes($nodes, $edges).then(({ nodes: layedOutNodes, edges: layedOutEdges }) => {
			$nodes = layedOutNodes
			$edges = layedOutEdges
		})

		fitView()
	}

	function nodeClick({ detail: { node } }) {
		selectedNode = $nodes.find((n) => n.id === node.id)
	}

	function paneClick() {
		selectedNode = null
		ctxMenu.paneClick()
	}

	function updateEdges(connection: Connection) {
		$localRev = 0
		let removalList: number[] = []
		$edges.forEach((e, i) => {
			e.type = 'smoothstep'
			e.animated = true

			// Remove any existing connections from the same source handle
			if (e.source === connection.source && e.sourceHandle === connection.sourceHandle && e.target !== connection.target) {
				removalList.push(i)
			}
		})
		$edges = $edges.filter((e, i) => !removalList.includes(i))
	}

	function init() {
		$behaviour = {
			id: crypto.randomUUID(),
			name: 'New Behaviour',
			description: ''
		}
		$nodes = newNodes
		$edges = newEdges
		$localRev = -1
		$serverRev = 0
		layout()
	}

	$: {
		changed = $behaviourStatus.id !== $behaviour.id || $behaviourStatus.revision !== $serverRev
		inSync = $localRev === $serverRev
	}

	onMount(async () => {
		await setup()
		const storedBehaviour = localStorage.getItem('bt.behaviour')
		if (storedBehaviour) {
			behaviour.set(JSON.parse(storedBehaviour))
		}
		const storedNodes = localStorage.getItem('bt.nodes')
		if (storedNodes) {
			nodes.set(JSON.parse(storedNodes))
		}
		const storedEdges = localStorage.getItem('bt.edges')
		if (storedEdges) {
			edges.set(JSON.parse(storedEdges))
		}
		// setTimeout(fitView, 250)
	})
	onDestroy(() => {
		teardown()
	})
</script>

<ContextMenu bind:this={ctxMenu} />
<OpenModal bind:this={ctxOpen} />

<Content class="bx--content-no-right-pad">
	<Grid fullWidth noGutter>
		<Row>
			<Column sm={4} md={4} lg={7} xlg={5}>
				<h2>Behaviour Planner</h2>

				<Form>
					<FormGroup legendText={$behaviour.id + ' rev ' + $serverRev}>
						<TextInput labelText="Name" bind:value={$behaviour.name} />
						<TextArea labelText="Description" bind:value={$behaviour.description} />
					</FormGroup>
				</Form>

				{#if selectedNode}
					<NodeParameters {selectedNode} />
				{:else}
					<h5>Select a node</h5>
				{/if}

				{#if changed}
					<InlineNotification
						lowContrast
						hideCloseButton
						kind="info"
						title="Working copy mismatch:"
						subtitle="The behaviour tree you have open does not match the version deployed on the server."
					/>
				{/if}
			</Column>
			<Column sm={3} md={4} lg={9} xlg={11} class="nodes-container">
				<SvelteFlow
					{nodes}
					{edges}
					nodeTypes={nodeMapping}
					{snapGrid}
					on:paneclick={paneClick}
					on:panecontextmenu={ctxMenu.paneContextMenu}
					on:nodeclick={nodeClick}
					on:nodecontextmenu={ctxMenu.nodeContextMenu}
					ondelete={() => {
						$localRev = 0
						selectedNode = null
					}}
					onconnect={updateEdges}
					connectionLineType={ConnectionLineType.SmoothStep}
					connectionLineStyle="stroke: var(--cds-support-03); stroke-width: 1.5px;"
					maxZoom={1}
					panOnDrag={[0, 1]}
					fitView
					class="nodes"
				>
					<Panel position="top-left">
						<Form>
							<FormGroup>
								<Button kind="ghost" size="field" iconDescription="New" icon={Document} disabled={$behaviourStatus.run} on:click={init}></Button>
								<Button kind="ghost" size="field" iconDescription="Open" icon={Folder} disabled={$behaviourStatus.run} on:click={ctxOpen.open}></Button>
								<Button
									kind={!inSync ? 'danger' : 'ghost'}
									size="field"
									iconDescription="Save"
									icon={!inSync ? Unsaved : Save}
									disabled={$behaviourStatus.run}
									on:click={() => save($behaviour, $nodes, $edges)}
								></Button>
								<Button
									kind={changed ? 'primary' : 'ghost'}
									size="field"
									iconDescription="Deploy"
									icon={Deploy}
									disabled={$behaviourStatus.run || !changed}
									on:click={() => deploy($behaviour.id)}
								></Button>
								<Button
									kind="ghost"
									size="field"
									iconDescription="Start"
									icon={Play}
									disabled={$behaviourStatus.run || $dro.needsHoming || changed}
									on:click={start}
								></Button>
								<Button kind="ghost" size="field" iconDescription="Stop" icon={Stop} on:click={stop}></Button>
								<Button kind="ghost" size="field" iconDescription="Reset" icon={Reset} disabled={$behaviourStatus.run} on:click={reset}></Button>
							</FormGroup>
						</Form>
					</Panel>
					<Panel position="top-right">
						<Button iconDescription="Layout" kind="ghost" size="field" icon={Movement} on:click={layout} />
					</Panel>
					<Background />
					<MiniMap position="bottom-left" />
				</SvelteFlow>
			</Column>
		</Row>
	</Grid>
</Content>

<style>
	:global(.bx--content-no-right-pad) {
		padding-right: 0;
		overflow: hidden;
	}
	:global(.nodes-container) {
		height: calc(100vh - 3rem);
		margin-bottom: -4rem;
	}
	:global(.nodes) {
		margin-top: -2rem;
		margin-bottom: -2rem;
	}
	:global(.tools) {
		height: calc(30vh - 0rem);
	}
</style>
