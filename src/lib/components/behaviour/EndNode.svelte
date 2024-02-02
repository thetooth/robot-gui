<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte'
	import { type EndNodeData } from './types';
	import NodeStatus from './NodeStatus.svelte'

	type $$Props = NodeProps

	export let id: $$Props['id']
	export let data:  EndNodeData = { label: 'Process End', continue: true}
	export let dragHandle: $$Props['dragHandle'] = undefined
	export let type: $$Props['type'] = 'end'
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
</script>

<Handle type="target" position={Position.Left} style="background: var(--cds-support-01);" />
<NodeStatus {id} />
<div>{data.label}</div>

<style>
	:global(.svelte-flow__node-end) {
		background-color: var(--cds-notification-background-error);
	}
	:global(.svelte-flow__node-end.selected) {
		background-color: var(--cds-ui-03);
	}
</style>
