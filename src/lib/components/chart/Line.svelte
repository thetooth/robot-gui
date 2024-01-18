<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { CircularBuffer } from 'cirbuf'
	import { getLineContext } from './context'

	const lines = getLineContext()

	export let color = 'black'
	export let points: CircularBuffer<any>

	let id = 0

	onMount(async () => {
		console.log('Line is mounted')

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
		console.log('Line is destroyed')
		lines.update((data) => {
			data.delete(id)
			return data
		})
	})
</script>
