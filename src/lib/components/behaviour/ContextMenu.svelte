<script lang="ts">
	import { addNode, deleteNode, NodeType, type ContextMenuEvent } from './'
	import { ContextMenu, ContextMenuOption, ContextMenuGroup, ContextMenuDivider } from 'carbon-components-svelte'

	let menu: ContextMenuEvent = {
		target: null,
		position: {
			x: 0,
			y: 0
		}
	}

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
		<ContextMenuOption indented kind="danger" labelText="Delete" shortcutText="↵" on:click={() => deleteNode(menu.target)} />
	{:else}
		<ContextMenuOption indented labelText="Process Start" on:click={(e) => addNode(NodeType.Start)} />
		<ContextMenuOption indented labelText="Process End" on:click={(e) => addNode(NodeType.End)} />
		<ContextMenuOption indented labelText="Controls">
			<ContextMenuOption indented labelText="Selector" on:click={(e) => addNode(NodeType.Selector)} />
			<ContextMenuOption indented labelText="Sequence" on:click={(e) => addNode(NodeType.Sequence)} />
			<ContextMenuOption indented labelText="Repeater" on:click={(e) => addNode(NodeType.Repeater)} />
			<ContextMenuOption indented labelText="Condition" on:click={(e) => addNode(NodeType.Condition)} />
		</ContextMenuOption>
		<ContextMenuOption indented labelText="Motion">
			<ContextMenuOption labelText="Move to Position" on:click={(e) => addNode(NodeType.MoveTo)} />
			<ContextMenuOption labelText="Pick up Object" on:click={(e) => addNode(NodeType.PickUp)} />
		</ContextMenuOption>
		<ContextMenuOption indented labelText="Gripper"></ContextMenuOption>
	{/if}
</ContextMenu>
