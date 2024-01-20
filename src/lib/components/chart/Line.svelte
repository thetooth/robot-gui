<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { CircularBuffer } from 'cirbuf'
	import { getLineContext } from './context'

	const lines = getLineContext()

	export let color = 'black'
	export let points: CircularBuffer<any>

	let id = 0

	onMount(async () => {
		lines.update((data) => {
			id = data.size
			data.set(id, {
				color: color,
				points: points
			})
			return data
		})
	})
	onDestroy(async () => {
		lines.update((data) => {
			data.delete(id)
			return data
		})
	})
</script>
