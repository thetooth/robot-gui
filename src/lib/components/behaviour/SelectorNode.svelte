<script lang="ts">
	import { Handle, Position, useHandleConnections, type NodeProps } from '@xyflow/svelte'
	import { type SelectorNodeData } from './types';
	import NodeStatus from './NodeStatus.svelte'

	type $$Props = NodeProps

	export let id: $$Props['id']
	export let data:  SelectorNodeData = { label: 'Selector', count: 1}
	export let dragHandle: $$Props['dragHandle'] = undefined
	export let type: $$Props['type'] = undefined
	export let selected: $$Props['selected'] = undefined
	export let isConnectable: $$Props['isConnectable'] = undefined
	export let zIndex: $$Props['zIndex'] = undefined
	export let width: $$Props['width'] = undefined
	export let height: $$Props['height'] = 80
	export let dragging: $$Props['dragging']
	export let targetPosition: $$Props['targetPosition'] = undefined
	export let sourcePosition: $$Props['sourcePosition'] = undefined
	export let positionAbsoluteX: $$Props['positionAbsoluteX'] = undefined
	export let positionAbsoluteY: $$Props['positionAbsoluteY'] = undefined

    // The absolute state of javascript
    id;dragHandle;type;selected;isConnectable;zIndex;width;height;dragging;targetPosition;sourcePosition;positionAbsoluteX;positionAbsoluteY;

	const inputs = useHandleConnections({ nodeId: id, type: 'target' });
	const outputs = useHandleConnections({ nodeId: id, type: 'source' });

	$: {
		isConnectable = $inputs.length === 0;
	}
</script>

<Handle type="target" position={Position.Left} style="background: var(--cds-support-03);" {isConnectable} />
<NodeStatus {id} />
<div class="svelte-flow__node-label">{data.label}</div>
<div class="svelte-flow__node-selector-handles">
	{#each Array.from({ length: data.count }, (_, i) => i + 1) as id}
		<Handle type="source" id={id.toString()} position={Position.Right} style={'background: var(--cds-support-03);top:' + id * 40 + 'px;height:36px;'} />
	{/each}
</div>

<style>
	:global(.svelte-flow__node-selector) {
		background-color: var(--xy-node-background-color, var(--xy-node-background-color-default));
		min-height: 120px;
	}
	:global(.svelte-flow__node-selector.selected) {
		background-color: var(--cds-ui-03);
	}
	.svelte-flow__node-selector-handles {
		display: flex;
		flex-direction: column;
	}
</style>
