<script lang="ts">
	import { NodeStatusType } from '../'
	import { behaviour, behaviourStatus } from '../'
	import {
		UnknownFilled,
		UndefinedFilled,
		InformationFilled,
		InProgress,
		Pending,
		Checkmark,
		WarningAltFilled,
		Incomplete,
		Unknown,
		CircleFill,
		CircleStroke,
		CheckmarkFilled
	} from 'carbon-icons-svelte'

	export let id: string
	let status: NodeStatusType = NodeStatusType.Unknown
	$: {
		if ($behaviourStatus.id !== $behaviour.id) {
			status = NodeStatusType.Unknown
		} else {
			$behaviourStatus.nodes.forEach((node) => {
				if (node.id === id) {
					status = node.status
				}
			})
		}
	}
</script>

<div class="status-tile">
	{#if status === NodeStatusType.Unknown}
		<!-- <UnknownFilled style="fill: var(--cds-support-01);" /> -->
	{:else if status === NodeStatusType.Running}
		<InProgress style="fill: var(--cds-support-04); opacity: 0.75" />
	{:else if status === NodeStatusType.Success}
		<CheckmarkFilled style="fill: var(--cds-support-04); opacity: 0.75" />
	{:else if status === NodeStatusType.Failure}
		<WarningAltFilled style="fill: var(--cds-support-01); opacity: 0.75" />
	{:else if status === NodeStatusType.Invalid}
		<UndefinedFilled style="fill: var(--cds-ui-04);" />
	{/if}
</div>

<style>
	.status-tile {
		position: absolute;
	}
</style>
