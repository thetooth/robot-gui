import { behaviour, nodes, edges } from './store'
import { calculateNodeSizes } from './layout'
import { js, jc } from '../../client'

import { NodeType, type SelectorNodeData, type SequenceNodeData, type MoveToNodeData, type ConditionNodeData, type Behaviour } from './types'
import { type Node, type Edge } from '@xyflow/svelte'

import StartNode from './StartNode.svelte'
import EndNode from './EndNode.svelte'
import SelectorNode from './SelectorNode.svelte'
import SequenceNode from './SequenceNode.svelte'
import ConditionNode from './ConditionNode.svelte'
import MoveNode from './MoveNode.svelte'
import type { KV } from 'nats.ws'

export let kv: KV = null

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

export async function kvSetup() {
	kv = await js.views.kv('behaviour')
}

export async function kvTeardown() {}

export async function load(id: string) {
	const behaviour = await kv.get(id)
	if (behaviour != null) {
		const b = jc.decode(behaviour.value) as Behaviour
		nodes.set(calculateNodeSizes(b.nodes))
		edges.set(b.edges)
	}
}

export async function commit(b: Behaviour, n: Node[], e: Edge[]) {
	b.nodes = n.map((node) => ({
		id: node.id,
		type: node.type as NodeType,
		data: node.data,
		width: node.width,
		height: node.height,
		position: node.position
	}))
	b.edges = e

	await kv.put('data.' + b.id, jc.encode(b))
	await kv.put('name.' + b.id, jc.encode(b.name))
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
