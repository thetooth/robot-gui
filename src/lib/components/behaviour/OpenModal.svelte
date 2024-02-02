<script lang="ts">
	import { behaviour, nodes, edges, kv, calculateNodeSizes, type Behaviour } from './'
	import { js, jc } from '../../client'

	import { useSvelteFlow } from '@xyflow/svelte'
	import { Button, Modal, TextInput, TileGroup, RadioTile } from 'carbon-components-svelte'
	import type { key } from '../../../../../xyflow/packages/svelte/dist/lib/store'

	let isOpen = false
	let isDeleting = false
	let keys: { id: string; name?: string }[] = []
	let selected: string = ''

	const { fitView } = useSvelteFlow()

	export async function open() {
		selected = ''
		keys = []
		const keyIterator = await kv.keys('name.*')
		console.log(keyIterator)
		for await (const k of keyIterator) {
			console.log(k)
			keys.push({
				id: k.split('.')[1]
			})
		}
		keys.forEach(async (key, i) => {
			let name = await kv.get('name.' + key.id)
			keys[i].name = jc.decode(name.value) as string
		})
		keys = [...keys]
		isOpen = true
	}

	async function load() {
		let b = await kv.get('data.' + selected)
		behaviour.set(jc.decode(b.value) as Behaviour)
		nodes.set(calculateNodeSizes($behaviour.nodes))
		edges.set($behaviour.edges)
		isOpen = false
		// fitView()
		setTimeout(fitView, 250)
	}

	async function destroy() {
		if (!selected) return
		await kv.delete('data.' + selected)
		await kv.delete('name.' + selected)
		isDeleting = false
	}
</script>

<Modal
	bind:open={isOpen}
	modalHeading="Load a Behaviour"
	primaryButtonText="Load"
	secondaryButtonText="Cancel"
	primaryButtonDisabled={!selected}
	on:click:button--primary={load}
	on:click:button--secondary={() => (isOpen = false)}
	on:open
	on:close
	on:submit
>
	<TileGroup legend="Select an existing behaviour model" name="plan" bind:selected>
		{#each keys as key}
			<RadioTile id={key.id} value={key.id} checked={selected === key.id}>
				{key.name}
			</RadioTile>
		{/each}
	</TileGroup>
	<Button
		kind="danger"
		size="small"
		on:click={() => {
			isOpen = false
			isDeleting = true
		}}
		disabled={!selected}>Delete Selected</Button
	>
</Modal>
<Modal
	danger
	bind:open={isDeleting}
	modalHeading="Delete behaviour"
	primaryButtonText="Delete"
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => (isDeleting = false)}
	on:click:button--primary={destroy}
	on:open
	on:close
	on:submit
>
	<p>This is a permanent action and cannot be undone.</p>
</Modal>
