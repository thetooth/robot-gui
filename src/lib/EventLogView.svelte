<script>
	import { events } from '../store'

	import { Content, DataTable, Pagination } from 'carbon-components-svelte'
	import { InformationFilled, WarningFilled, ErrorFilled } from 'carbon-icons-svelte'

	const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1)

	let eventHeader = [
		{ key: 'level', value: 'Severity', width: '10%' },
		{ key: 'time', value: 'Time', width: '20%' },
		{ key: 'msg', value: 'Message' }
	]
	let eventPageSize = 12
	let eventPage = 1
</script>

<Content>
	<h2>Event Log</h2>
	<DataTable sortable sortKey="time" sortDirection="descending" zebra headers={eventHeader} rows={$events} bind:pageSize={eventPageSize} bind:page={eventPage}>
		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'level'}
				{#if cell.value === 'info'}
					<InformationFilled class="table-icon" color="var(--cds-interactive-01)" />
				{:else if cell.value === 'warn'}
					<WarningFilled class="table-icon" color="var(--cds-warning)" />
				{:else if cell.value === 'error'}
					<ErrorFilled class="table-icon" color="var(--cds-danger)" />
				{/if}
				{capitalize(cell.value)}
			{:else if cell.key === 'time'}
				{new Date(cell.value / 1000000).toLocaleString()}
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
	</DataTable>
	<Pagination bind:pageSize={eventPageSize} bind:page={eventPage} totalItems={$events.length} pageSizeInputDisabled />
	<div style="height:4rem"></div>
</Content>

<style>
	:global(.table-icon) {
		margin-bottom: -3px;
	}
</style>
