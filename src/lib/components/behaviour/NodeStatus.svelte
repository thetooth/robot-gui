<script lang="ts">
	import { NodeStatusType } from '.'
	import { behaviour, behaviourStatus } from '.'
	import { UnknownFilled, InProgress, Pending, Checkmark, WarningAltFilled, Incomplete, Unknown, CircleFill, CircleStroke, CheckmarkFilled } from 'carbon-icons-svelte'

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
		<CircleFill viewBox="0 0 16 16" style="fill: var(--cds-support-04); opacity: 0.75" />
	{:else if status === NodeStatusType.Success}
		<CheckmarkFilled style="fill: var(--cds-support-04); opacity: 0.75" />
	{:else if status === NodeStatusType.Failure}
		<WarningAltFilled style="fill: var(--cds-support-01); opacity: 0.75" />
	{:else if status === NodeStatusType.Invalid}
		<UnknownFilled style="fill: var(--cds-support-03);" />
	{/if}
</div>

<style>
	.status-tile {
		position: absolute;
	}
</style>
