<script lang="ts">
	import { keys, load, destroy } from './'

	import { useSvelteFlow } from '@xyflow/svelte'
	import { Button, Modal, TextInput, TileGroup, RadioTile } from 'carbon-components-svelte'

	let isOpen = false
	let isDeleting = false
	let selected: string = ''

	const { fitView } = useSvelteFlow()

	export async function open() {
		selected = ''
		isOpen = true
	}

	async function doLoad() {
		await load(selected)
		isOpen = false
		setTimeout(fitView, 250)
	}

	async function doDelete() {
		await destroy(selected)
		isDeleting = false
	}
</script>

<Modal
	bind:open={isOpen}
	modalHeading="Load a Behaviour"
	primaryButtonText="Load"
	secondaryButtonText="Cancel"
	primaryButtonDisabled={!selected}
	on:click:button--primary={doLoad}
	on:click:button--secondary={() => (isOpen = false)}
	on:open
	on:close
	on:submit
>
	<TileGroup legend="Select an existing behaviour model" name="plan" bind:selected>
		{#each $keys as [id, name]}
			<RadioTile {id} value={id} checked={selected === id}>
				{name}
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
	on:click:button--primary={doDelete}
	on:open
	on:close
	on:submit
>
	<p>This is a permanent action and cannot be undone.</p>
</Modal>
