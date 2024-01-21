<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { CircularBuffer } from 'cirbuf'
	import { color as colorSpace } from 'd3-color'
	import { getLineContext } from './context'

	const lines = getLineContext()

	export let color = 'black'
	export let width = 1
	export let points: CircularBuffer<any>

	let id = 0

	onMount(async () => {
		lines.update((data) => {
			id = data.size
			data.set(id, {
				color: colorSpace(color),
				width: width,
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
