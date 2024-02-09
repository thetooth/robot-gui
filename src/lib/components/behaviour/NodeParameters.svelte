<script lang="ts">
	import { keys, nodes, edges, calculateNodeSizes, localRev, load, behaviourStatus } from './'
	import { useSvelteFlow, type Node } from '@xyflow/svelte'
	import { Button, Checkbox, Form, FormGroup, NumberInput, Select, SelectItem, Slider, TextInput, Toggle, Tooltip } from 'carbon-components-svelte'
	import { dro, controls } from '../../store'
	import { immediate } from '../../client'

	export let selectedNode: Node

	const { deleteElements } = useSvelteFlow()
	let hot = false

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
					case 'moveTo':
						$controls = n.data.pose
						break
				}
			}
		})
		$nodes = calculateNodeSizes($nodes)
	}

	function placeHere() {
		selectedNode.data.pose.x = Math.round($dro.pose.x)
		selectedNode.data.pose.y = Math.round($dro.pose.y)
		selectedNode.data.pose.z = Math.round($dro.pose.z)
		selectedNode.data.pose.r = Math.round($dro.pose.r)
	}

	$: {
		if (hot && !$behaviourStatus.run && selectedNode.type === 'moveTo') {
			$controls = selectedNode.data.pose
			immediate($controls.x, $controls.y, $controls.z, $controls.r)
		}
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
	{:else if selectedNode.type === 'delay'}
		<FormGroup>
			<NumberInput label="Delay (ms)" min={0} bind:value={selectedNode.data.delay} on:input={updateNode} />
		</FormGroup>
	{:else if selectedNode.type === 'moveTo'}
		<FormGroup>
			<Slider labelText="X" fullWidth min={-400} max={400} step={1} bind:value={selectedNode.data.pose.x} on:change={updateNode} />
			<Slider labelText="Y" fullWidth min={-400} max={400} step={1} bind:value={selectedNode.data.pose.y} on:change={updateNode} />
			<Slider labelText="Z" fullWidth min={0} max={150} step={1} bind:value={selectedNode.data.pose.z} on:change={updateNode} />
			<Slider labelText="R" fullWidth min={-180} max={180} step={1} bind:value={selectedNode.data.pose.r} on:change={updateNode} />
			<Button kind="ghost" size="small" on:click={placeHere}>Set Cursor Here</Button>
		</FormGroup>
		<FormGroup>
			<Checkbox labelText="Live movement" bind:checked={hot} on:change={updateNode} />
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
