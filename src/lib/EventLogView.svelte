<script>
	import { events } from './store'

	import { Content, DataTable, Pagination, Toolbar, ToolbarContent, ToolbarSearch, ToolbarMenu, ToolbarMenuItem, MultiSelect, CodeSnippet } from 'carbon-components-svelte'
	import { InformationFilled, WarningAltFilled, ErrorFilled, Debug, CriticalSeverity, Asset, Repeat } from 'carbon-icons-svelte'

	const capitalize = (s) => s && s[0].toUpperCase() + s.slice(1)

	let levelFilter = ['info', 'warning', 'error', 'critical']
	let filteredRowIds = []
	let eventHeader = [
		{ key: 'level', value: 'Severity', width: '8rem' },
		{ key: 'time', value: 'Time', width: '17.5rem' },
		{ key: 'msg', value: 'Message' }
	]
	let eventPageSize = 10
	let eventPage = 1
</script>

<Content>
	<h2>Event Log</h2>
	<DataTable
		sortable
		sortKey="time"
		sortDirection="descending"
		expandable
		batchExpansion
		nonExpandableRowIds={$events.filter((p) => p.detail === undefined).map((p) => p.id)}
		headers={eventHeader}
		rows={$events}
		bind:pageSize={eventPageSize}
		bind:page={eventPage}
	>
		<Toolbar>
			<ToolbarContent>
				<ToolbarSearch persistent shouldFilterRows bind:filteredRowIds />
			</ToolbarContent>
		</Toolbar>
		<svelte:fragment slot="cell" let:row let:cell>
			{#if cell.key === 'level'}
				<span class="level-text">{capitalize(cell.value)}</span>
				<span class="level-icon">
					{#if cell.value === 'info'}
						<InformationFilled class="table-icon" color="var(--cds-support-info)" />
					{:else if cell.value === 'warning'}
						<WarningAltFilled class="table-icon" color="var(--cds-support-warning)" />
					{:else if cell.value === 'error'}
						<ErrorFilled class="table-icon" color="var(--cds-support-error)" />
					{:else if cell.value === 'critical'}
						<CriticalSeverity class="table-icon" color="var(--cds-support-error)" viewBox="0 0 16 16" />
					{:else if cell.value === 'kinematic'}
						<Asset class="table-icon" />
					{:else if cell.value === 'ethercat'}
						<Repeat class="table-icon" />
					{:else}
						<Debug class="table-icon" color="var(--cds-support-success)" />
					{/if}
				</span>
			{:else if cell.key === 'time'}
				{new Date(cell.value / 1000000).toLocaleString()} +{((cell.value % 1000000000) / 1000000).toFixed(4).padStart(8, '0')} ms
			{:else}
				{cell.value}
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="expanded-row" let:row>
			<br />
			<h5>Details</h5>
			{#if typeof row.detail == 'string'}
				<p><CodeSnippet type="multi" code={row.detail} expanded /></p>
			{:else}
				<p><CodeSnippet type="multi" code={JSON.stringify(row.detail, null, 2)} /></p>
			{/if}
		</svelte:fragment>
	</DataTable>
	<Pagination bind:pageSize={eventPageSize} bind:page={eventPage} totalItems={filteredRowIds.length} pageSizeInputDisabled />
	<div style="height:4rem"></div>
</Content>

<style>
	:global(.table-icon) {
		margin-bottom: -3px;
	}
	:global(.level-text) {
		width: 4rem;
		display: inline-block;
	}
	:global(.bx--toolbar-content .bx--list-box) {
		border-bottom: none;
	}
</style>
