<script lang="ts">
	import { Handle, Position, useHandleConnections, type NodeProps } from '@xyflow/svelte'
	import { Grid, Row, Column, Form, FormGroup, NumberInput } from 'carbon-components-svelte'
	import NodeStatus from './NodeStatus.svelte'

	type $$Props = NodeProps

	export let id: $$Props['id']
	export let data: $$Props['data']
	export let dragHandle: $$Props['dragHandle'] = undefined
	export let type: $$Props['type'] = undefined
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

	let zHeight = 0
	$: {
		isConnectable = $inputs.length === 0;
		zHeight = data.height
	}
</script>

<Handle type="target" position={Position.Left} style="background: var(--cds-support-03);" {isConnectable} />
<NodeStatus {id} />
<div>Pick Up</div>
<br />
<Grid fullWidth noGutter class="grid">
	<Row>
		<Column sm={1}>Z:</Column>
		<Column sm={1}>{zHeight}</Column>
	</Row>
</Grid>

<style>
	:global(.svelte-flow__node-pickUp) {
		background-color: var(--xy-node-background-color, var(--xy-node-background-color-default));
		height: 80px;
	}
	:global(.svelte-flow__node-pickUp.selected) {
		background-color: var(--cds-ui-03);
	}
	:global(.svelte-flow__node-pickUp .grid) {
		font-family: var(--cds-code-01-font-family, 'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace);
		font-size: 0.675rem;
	}
</style>
