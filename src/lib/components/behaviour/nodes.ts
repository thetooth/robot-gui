import { behaviour, nodes, edges, behaviourStatus } from './store'
import { calculateNodeSizes } from './layout'
import { js, jc, nc } from '../../client'

import {
	NodeType,
	type SelectorNodeData,
	type SequenceNodeData,
	type MoveToNodeData,
	type ConditionNodeData,
	type Behaviour,
	type PickUpNodeData,
	type BehaviourStatus
} from './types'
import { type Node, type Edge } from '@xyflow/svelte'

import StartNode from './StartNode.svelte'
import EndNode from './EndNode.svelte'
import SelectorNode from './SelectorNode.svelte'
import SequenceNode from './SequenceNode.svelte'
import ConditionNode from './ConditionNode.svelte'
import MoveNode from './MoveNode.svelte'
import PickupNode from './PickupNode.svelte'
import type { KV } from 'nats.ws'

export let kv: KV = null
export let nodeStatusSub = null

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
	moveTo: MoveNode,
	pickUp: PickupNode
}

export async function setup() {
	kv = await js.views.kv('behaviour')
	nodeStatusSub = nc.subscribe('behaviour.status')
	;(async () => {
		for await (const m of nodeStatusSub) {
			const status = jc.decode(m.data) as BehaviourStatus
			behaviourStatus.set(status)
		}
	})()
}

export async function teardown() {
	nodeStatusSub.unsubscribe()
}

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

export async function deploy(id: string) {
	let command = {
		command: 'load',
		id: id
	}

	await nc.publish('behaviour.command', jc.encode(command))
}

export function start() {
	nc.publish(
		'behaviour.command',
		jc.encode({
			command: 'start'
		})
	)
}

export function stop() {
	nc.publish(
		'behaviour.command',
		jc.encode({
			command: 'stop'
		})
	)
}

export function reset() {
	nc.publish(
		'behaviour.command',
		jc.encode({
			command: 'reset'
		})
	)
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
			case NodeType.PickUp:
				n.push({
					id: 'pickUp-' + n.length,
					type: NodeType.PickUp,
					data: {
						label: 'Pick up',
						height: 0
					} as PickUpNodeData,
					position
				})
				break
		}
		return calculateNodeSizes(n)
	})
}
