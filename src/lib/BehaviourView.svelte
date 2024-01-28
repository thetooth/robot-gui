<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { kvSetup, behaviour, nodes, edges, nodeMapping, layoutNodes, calculateNodeSizes, newNodes, newEdges, commit } from './components/behaviour'
	import { SvelteFlow, useSvelteFlow, Background, MiniMap, Panel, type Node, type Edge, type SnapGrid, ConnectionLineType } from '@xyflow/svelte'

	import { Content, Tile, Select, SelectItem, Grid, Row, Column, Form, FormGroup, Toggle, Button, TextInput, NumberInput, Slider, TextArea } from 'carbon-components-svelte'
	import { Movement, Recording, Stop, Play, Reset, Save, Document, Folder } from 'carbon-icons-svelte'
	import { Connect } from 'carbon-pictograms-svelte'

	import '@xyflow/svelte/dist/style.css'
	import './components/behaviour/style.css'

	import Model from './Model.svelte'
	import ContextMenu from './components/behaviour/ContextMenu.svelte'
	import OpenModal from './components/behaviour/OpenModal.svelte'

	const snapGrid: SnapGrid = [20, 20]

	const { fitView } = useSvelteFlow()

	let flow: HTMLElement
	let ctxMenu: ContextMenu
	let ctxOpen: OpenModal
	let selectedNode: Node

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

	function updateNode() {
		console.log('updateNode')
		$nodes.forEach((n) => {
			if (n.id === selectedNode.id) {
				// Must mutate data object to trigger update
				n.data = {
					...selectedNode.data
				}
				switch (n.type) {
					case 'sequence':
						$edges = $edges.filter((e) => {
							if (e.source === n.id) {
								console.log(e.sourceHandle, n.data.count)
								return !(Number(e.sourceHandle) > n.data.count)
							}
							return true
						})
						break
				}
			}
		})
		$nodes = calculateNodeSizes($nodes)
	}

	function updateEdges() {
		$edges.forEach((e) => {
			e.type = 'smoothstep'
			e.animated = true
		})
		$edges = [...$edges]
	}

	function init() {
		$behaviour = {
			id: crypto.randomUUID(),
			name: 'New Behaviour',
			description: ''
		}
		$nodes = newNodes
		$edges = newEdges
		layout()
	}

	onMount(async () => {
		await kvSetup()
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
</script>

<ContextMenu bind:this={ctxMenu} />
<OpenModal bind:this={ctxOpen} />

<Content class="bx--content-no-right-pad">
	<Grid fullWidth noGutter>
		<Row>
			<Column sm={4} md={4} lg={7} xlg={5}>
				<h2>Behaviour Planner</h2>
				<Form>
					<FormGroup legendText={$behaviour.id}>
						<TextInput labelText="Name" bind:value={$behaviour.name} />
						<TextArea labelText="Description" bind:value={$behaviour.description} />
					</FormGroup>
				</Form>
				{#if selectedNode}
					<h4>{selectedNode.data.label}</h4>
					<Form>
						{#if selectedNode.type === 'start'}
							<p>This is the start of the process</p>
						{:else if selectedNode.type === 'end'}
							<FormGroup legendText="Options">
								<Toggle labelText="When this node is reached, start the process again" size="sm" bind:toggled={selectedNode.data.continue} on:change={updateNode} />
							</FormGroup>
						{:else if selectedNode.type === 'sequence' || selectedNode.type === 'selector'}
							<FormGroup legendText="Options">
								<NumberInput label="Number of steps" min={2} bind:value={selectedNode.data.count} on:input={updateNode} />
							</FormGroup>
						{:else if selectedNode.type === 'condition'}
							<FormGroup legendText="Options">
								<TextInput labelText="Label" bind:value={selectedNode.data.label} on:input={updateNode} />
								<Select labelText="Condition" on:change={updateNode}>
									<SelectItem text="True" value="true" />
									<SelectItem text="False" value="false" />
								</Select>
							</FormGroup>
						{:else if selectedNode.type === 'moveTo'}
							<FormGroup>
								<Slider labelText="X" fullWidth min={-400} max={400} step={1} bind:value={selectedNode.data.pose.x} on:change={updateNode} />
								<Slider labelText="Y" fullWidth min={-400} max={400} step={1} bind:value={selectedNode.data.pose.y} on:change={updateNode} />
								<Slider labelText="Z" fullWidth min={0} max={150} step={1} bind:value={selectedNode.data.pose.z} on:change={updateNode} />
								<Slider labelText="R" fullWidth min={-180} max={180} step={1} bind:value={selectedNode.data.pose.r} on:change={updateNode} />
							</FormGroup>
						{:else}
							<p>Unknown node type</p>
						{/if}
					</Form>
				{:else}
					<h5>Select a node</h5>
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
								<Button kind="ghost" size="field" iconDescription="New" icon={Document} on:click={init}></Button>
								<Button kind="ghost" size="field" iconDescription="Open" icon={Folder} on:click={ctxOpen.open}></Button>
								<Button kind="ghost" size="field" iconDescription="Commit" icon={Save} on:click={() => commit($behaviour, $nodes, $edges)}></Button>
								<Button kind="ghost" size="field" iconDescription="Play" icon={Play} disabled></Button>
								<Button kind="ghost" size="field" iconDescription="Stop" icon={Stop} disabled></Button>
								<Button kind="ghost" size="field" iconDescription="Reset" icon={Reset} disabled></Button>
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
