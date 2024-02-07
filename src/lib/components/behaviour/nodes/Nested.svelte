<script lang="ts">
	import { Handle, Position, useHandleConnections, type NodeProps } from '@xyflow/svelte'
	import { Grid, Row, Column } from 'carbon-components-svelte'
	import { type NestedNodeData } from '../types';
	import { keys } from '../'
	import NodeStatus from './NodeStatus.svelte'

	type $$Props = NodeProps

	export let id: $$Props['id']
	export let data:  NestedNodeData = { label: 'Process Start', id: '' }
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

	const inputs = useHandleConnections({ nodeId: id, type: 'target' });

	let label = 'Nested';

	$:  {
		isConnectable = $inputs.length === 0;
		if ($keys.has(data.id)){
			label = $keys.get(data.id);
		}else{
			label = 'Not set!';
		}
	}
</script>

<Handle type="target" position={Position.Left} style="background: var(--cds-support-02);" {isConnectable} />
<NodeStatus {id} />
<div>&gt;<em>{label}</em></div>

<style>
	:global(.svelte-flow__node-nested) {
		background-color: var(--cds-notification-background-success);
	}
	:global(.svelte-flow__node-nested.selected) {
		background-color: var(--cds-ui-03);
	}
	:global(.svelte-flow__node-nested .grid) {
		font-size: 0.675rem;
	}
</style>
