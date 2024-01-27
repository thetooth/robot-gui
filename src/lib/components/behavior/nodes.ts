import { nodes, edges } from './store'
import { calculateNodeSizes } from './layout'
import { NodeType, type SelectorNodeData, type SequenceNodeData, type MoveToNodeData, type ConditionNodeData } from './types'

import StartNode from './StartNode.svelte'
import EndNode from './EndNode.svelte'
import SelectorNode from './SelectorNode.svelte'
import SequenceNode from './SequenceNode.svelte'
import ConditionNode from './ConditionNode.svelte'
import MoveNode from './MoveNode.svelte'

export const nodeMapping = {
	// Core types
	start: StartNode,
	end: EndNode,
	sequence: SequenceNode,
	selector: SelectorNode,
	// parallel: ParallelNode,
	// decorator: DecoratorNode,
	condition: ConditionNode,

	// Action types
	moveTo: MoveNode
}

export function deleteNode(target: string) {
	nodes.update((n) => n.filter((node) => node.id !== target))
	edges.update((e) => e.filter((edge) => edge.source !== target && edge.target !== target))
}

export function addNode(type: NodeType, position = { x: 0, y: 0 }) {
	nodes.update((n) => {
		switch (type) {
			case NodeType.Selector:
				n.push({
					id: 'selector-' + n.length,
					type: NodeType.Selector,
					data: {
						label: 'Selector',
						count: 2
					} as SelectorNodeData,
					position
				})
				break
			case NodeType.Sequence:
				n.push({
					id: 'sequence-' + n.length,
					type: NodeType.Sequence,
					data: {
						label: 'Sequence',
						count: 2,
						activeTask: 0
					} as SequenceNodeData,
					position
				})
				break
			case NodeType.Condition:
				n.push({
					id: 'condition-' + n.length,
					type: NodeType.Condition,
					data: {
						label: 'Condition ' + n.length
					} as ConditionNodeData,
					position
				})
				break
			case NodeType.MoveTo:
				n.push({
					id: 'moveTo-' + n.length,
					type: NodeType.MoveTo,
					data: {
						label: 'Move to',
						pose: {
							x: 0,
							y: 0,
							z: 0,
							r: 0
						}
					} as MoveToNodeData,
					position
				})
				break
		}
		return calculateNodeSizes(n)
	})
}
