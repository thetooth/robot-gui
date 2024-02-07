<script lang="ts">
	import { nodes, addNode, deleteNode, NodeType, type ContextMenuEvent } from './'
	import { ContextMenu, ContextMenuOption, ContextMenuGroup, ContextMenuDivider } from 'carbon-components-svelte'
	import {
		Power,
		StopSign,
		Movement,
		Recording,
		Stop,
		Play,
		Reset,
		Save,
		Unsaved,
		Document,
		Folder,
		Deploy,
		CicsSystemGroup,
		Subflow,
		Repeat,
		ConditionPoint,
		PartitionSpecific,
		PartitionAuto,
		Timer,
		Move,
		Need,
		DecisionTree,
		StopSignFilled,
		Ai,
		TrashCan
	} from 'carbon-icons-svelte'

	let menu: ContextMenuEvent = {
		target: null,
		position: {
			x: 0,
			y: 0
		}
	}
	// let haveStartNode = $state(false)
	$: haveStartNode = $nodes.some((node) => node.type === NodeType.Start)

	export function paneClick() {
		menu.target = null
	}

	export function paneContextMenu({ detail: { event } }) {
		paneClick()
	}

	export function nodeContextMenu({ detail: { event, node } }) {
		menu.target = node?.id || null
		// TODO: Use event.clientX and event.clientY to place the node under the cursor
		menu.position = {
			x: 0, //event.clientX,
			y: 500 //event.clientY
		}
	}
</script>

<ContextMenu>
	{#if menu.target !== null}
		<ContextMenuOption indented kind="danger" labelText="Delete" shortcutText="↵" icon={TrashCan} on:click={() => deleteNode(menu.target)} />
	{:else}
		<ContextMenuOption indented labelText="Process Start" on:click={(e) => addNode(NodeType.Start)} icon={Power} disabled={haveStartNode} />
		<ContextMenuOption indented labelText="Process End" on:click={(e) => addNode(NodeType.End)} icon={StopSignFilled} />
		<ContextMenuDivider />
		<ContextMenuOption indented labelText="Nested Behaviour" on:click={(e) => addNode(NodeType.Nested)} icon={Subflow} />
		<ContextMenuDivider />
		<ContextMenuOption indented labelText="Flow Control" icon={DecisionTree}>
			<ContextMenuOption indented labelText="Selector" on:click={(e) => addNode(NodeType.Selector)} icon={PartitionSpecific} />
			<ContextMenuOption indented labelText="Sequence" on:click={(e) => addNode(NodeType.Sequence)} icon={PartitionAuto} />
			<ContextMenuOption indented labelText="Repeater" on:click={(e) => addNode(NodeType.Repeater)} icon={Repeat} />
			<ContextMenuOption indented labelText="Condition" on:click={(e) => addNode(NodeType.Condition)} icon={ConditionPoint} />
			<ContextMenuOption indented labelText="Delay" on:click={(e) => addNode(NodeType.Delay)} icon={Timer} />
		</ContextMenuOption>
		<ContextMenuDivider />
		<ContextMenuOption indented labelText="Motion" icon={Movement}>
			<ContextMenuOption indented labelText="Move to Position" on:click={(e) => addNode(NodeType.MoveTo)} icon={Move} />
			<ContextMenuOption indented labelText="Pick up Object" on:click={(e) => addNode(NodeType.PickUp)} icon={Need} />
		</ContextMenuOption>
		<ContextMenuDivider />
		<ContextMenuOption indented labelText="Machine Vision" icon={Ai}></ContextMenuOption>
	{/if}
</ContextMenu>
