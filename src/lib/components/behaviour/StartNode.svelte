<script lang="ts">
	import { Handle, Position, useHandleConnections, type NodeProps } from '@xyflow/svelte'
	import { type StartNodeData } from './types';

	type $$Props = NodeProps

	export let id: $$Props['id']
	export let data:  StartNodeData = { label: 'Process Start'}
	export let dragHandle: $$Props['dragHandle'] = undefined
	export let type: $$Props['type'] = 'start'
	export let selected: $$Props['selected'] = undefined
	export let isConnectable: $$Props['isConnectable'] = undefined
	export let zIndex: $$Props['zIndex'] = undefined
	export let width: $$Props['width'] = undefined
	export let height: $$Props['height'] = undefined
	export let dragging: $$Props['dragging']
	export let targetPosition: $$Props['targetPosition'] = undefined
	export let sourcePosition: $$Props['sourcePosition'] = undefined
	export let positionAbsoluteX: $$Props['positionAbsoluteX'] = undefined
	export let positionAbsoluteY: $$Props['positionAbsoluteY'] = undefined

    // The absolute state of javascript
    id;dragHandle;type;selected;isConnectable;zIndex;width;height;dragging;targetPosition;sourcePosition;positionAbsoluteX;positionAbsoluteY;

	const inputs = useHandleConnections({ nodeId: id, type: 'source' });

	$:  isConnectable = $inputs.length === 0;
</script>

<Handle type="source" position={Position.Right} style="background: var(--cds-support-04);" {isConnectable} />
<div>{data.label}</div>

<style>
	:global(.svelte-flow__node-start) {
		background-color: var(--cds-notification-background-info);
	}
	:global(.svelte-flow__node-start.selected) {
		background-color: var(--cds-ui-03);
	}
</style>
