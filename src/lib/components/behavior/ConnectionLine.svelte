<script lang="ts">
	import { useConnection } from '@xyflow/svelte'

	const connection = useConnection()

	let path = ''

	$: {
		const { sourceX, sourceY, targetX, targetY } = $connection
		path = `M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`
	}
</script>

{#if $connection.path}
	<path fill="none" stroke-width={1.5} class="animated" stroke="var(--cds-ui-04)" d={path} />
{/if}
