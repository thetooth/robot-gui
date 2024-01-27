<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { nodes, edges, nodeMapping, getLayoutedElements, calculateNodeSizes, initialNodes, initialEdges } from './components/behavior'
	import { SvelteFlow, useSvelteFlow, Background, MiniMap, Panel, type Node, type Edge, type SnapGrid, ConnectionLineType } from '@xyflow/svelte'

	import { Content, Tile, Select, SelectItem, Grid, Row, Column, Form, FormGroup, Toggle, Button, TextInput, NumberInput, Slider } from 'carbon-components-svelte'
	import { Movement } from 'carbon-icons-svelte'

	import '@xyflow/svelte/dist/style.css'
	import './components/behavior/style.css'

	import Model from './Model.svelte'
	import ContextMenu from './components/behavior/ContextMenu.svelte'

	const snapGrid: SnapGrid = [20, 20]

	const { fitView } = useSvelteFlow()

	let flow: HTMLElement
	let ctxMenu: ContextMenu
	let selectedNode: Node

	async function layout() {
		nodes.set(calculateNodeSizes($nodes))

		getLayoutedElements($nodes, $edges).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
			$nodes = layoutedNodes
			$edges = layoutedEdges
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

	function dump() {
		console.log(
			JSON.stringify(
				$nodes.map((n) => ({
					id: n.id,
					type: n.type,
					data: n.data
				}))
			)
		)
		console.log(JSON.stringify($edges.map((e) => ({ id: e.id, source: e.source, sourceHandle: e.sourceHandle, target: e.target }))))
	}

	function init() {
		$nodes = initialNodes
		$edges = initialEdges
		layout()
		setTimeout(fitView, 100)
	}

	onMount(async () => {
		const storedNodes = localStorage.getItem('behaviorTree.nodes')
		if (storedNodes) {
			nodes.set(JSON.parse(storedNodes))
		}
		const storedEdges = localStorage.getItem('behaviorTree.edges')
		if (storedEdges) {
			edges.set(JSON.parse(storedEdges))
		}
		setTimeout(fitView, 100)
	})
</script>

<ContextMenu bind:this={ctxMenu} />

<Content class="bx--content-no-right-pad">
	<Grid fullWidth noGutter>
		<Row>
			<Column sm={4} md={4} lg={7} xlg={5}>
				<h2>Behavior Planner</h2>
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
				<Button kind="primary" on:click={dump}>Dump</Button>
				<Button kind="primary" on:click={init}>Init</Button>
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
