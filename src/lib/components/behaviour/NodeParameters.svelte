<script lang="ts">
	import { keys, nodes, edges, calculateNodeSizes, localRev, load } from './'
	import { useSvelteFlow, type Node } from '@xyflow/svelte'
	import { Button, Form, FormGroup, NumberInput, Select, SelectItem, Slider, TextInput, Toggle } from 'carbon-components-svelte'

	export let selectedNode: Node

	const { deleteElements } = useSvelteFlow()

	function updateNode() {
		$localRev = 0
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
</script>

<h4>{selectedNode.data.label}</h4>
<Form>
	{#if selectedNode.type === 'start'}
		<p>This is the start of the process</p>
	{:else if selectedNode.type === 'end'}
		<FormGroup>
			<Toggle labelText="When this node is reached, start the process again" size="sm" bind:toggled={selectedNode.data.continue} on:change={updateNode} />
		</FormGroup>
	{:else if selectedNode.type === 'nested'}
		<FormGroup>
			<Select
				labelText="Behaviour"
				placeholder="Select a nested behaviour"
				required
				invalid={selectedNode.data.id === ''}
				bind:selected={selectedNode.data.id}
				on:change={(v) => {
					// selectedNode.data.id = v
					updateNode()
				}}
			>
				{#each $keys as [id, key]}
					<SelectItem text={key} value={id} />
				{/each}
			</Select>
		</FormGroup>

		<Button kind="primary" on:click={() => load(selectedNode.data.id)}>Open</Button>
	{:else if selectedNode.type === 'sequence' || selectedNode.type === 'selector'}
		<FormGroup>
			<NumberInput label="Number of steps" min={2} bind:value={selectedNode.data.count} on:input={updateNode} />
		</FormGroup>
	{:else if selectedNode.type === 'repeater'}
		<FormGroup>
			<NumberInput label="Number of times to repeat" min={0} bind:value={selectedNode.data.count} on:input={updateNode} />
		</FormGroup>
	{:else if selectedNode.type === 'condition'}
		<FormGroup>
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
	{:else if selectedNode.type === 'pickUp'}
		<FormGroup>
			<Slider labelText="Z Height" fullWidth min={0} max={150} step={1} bind:value={selectedNode.data.height} on:change={updateNode} />
		</FormGroup>
	{:else}
		<p>Unknown node type</p>
	{/if}
</Form>

<style>
</style>
