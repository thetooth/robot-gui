import { behaviour, nodes, edges, behaviourStatus, localRev, serverRev, keys } from './store'
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
	type BehaviourStatus,
	type StartNodeData,
	type EndNodeData,
	type NestedNodeData
} from './types'
import { type Node, type Edge } from '@xyflow/svelte'

import Start from './nodes/Start.svelte'
import End from './nodes/End.svelte'
import Nested from './nodes/Nested.svelte'
import Selector from './nodes/Selector.svelte'
import Sequence from './nodes/Sequence.svelte'
import Repeater from './nodes/Repeater.svelte'
import Condition from './nodes/Condition.svelte'
import Move from './nodes/MoveTo.svelte'
import Pickup from './nodes/Pickup.svelte'
import type { KV, KvEntry, QueuedIterator } from 'nats.ws'

export let kv: KV = null
export let nodeStatusSub = null
export let keySub: QueuedIterator<KvEntry>

export const nodeMapping = {
	// Control types
	start: Start,
	end: End,
	nested: Nested,

	// Composite types
	selector: Selector,
	sequence: Sequence,
	// parallel: Parallel,

	// Decorator types
	// decorator: Decorator,
	condition: Condition,
	repeater: Repeater,

	// Action types
	moveTo: Move,
	pickUp: Pickup
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
	keySub = await kv.watch({ key: 'name.*', headers_only: false })
	;(async () => {
		for await (const m of keySub) {
			console.log(m.key.split('.')[1], m.string(), m.operation)
			keys.update((k) => {
				if (m.operation === 'PUT') {
					k.set(m.key.split('.')[1], jc.decode(m.value) as string)
				} else if (m.operation === 'DEL' || m.operation === 'PURGE') {
					k.delete(m.key.split('.')[1])
				}
				return k
			})
		}
	})()
}

export async function teardown() {
	nodeStatusSub.unsubscribe()
	keySub.stop()
}

export async function load(id: string) {
	let res = await kv.get('data.' + id)
	if (res != null) {
		const b = jc.decode(res.value) as Behaviour
		behaviour.set(b)
		localRev.set(res.revision)
		serverRev.set(res.revision)
		nodes.set(calculateNodeSizes(b.nodes))
		edges.set(b.edges)
	}
}

export async function save(b: Behaviour, n: Node[], e: Edge[]) {
	b.nodes = n.map((node) => ({
		id: node.id,
		type: node.type as NodeType,
		data: node.data,
		width: node.width,
		height: node.height,
		position: node.position
	}))
	b.edges = e

	const rev = await kv.put('data.' + b.id, jc.encode(b))
	await kv.put('name.' + b.id, jc.encode(b.name))

	localRev.set(rev)
	serverRev.set(rev)
}

export async function destroy(id: string) {
	if (!id) return
	await kv.delete('data.' + id)
	await kv.delete('name.' + id)
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
	localRev.set(0)
	nodes.update((n) => {
		switch (type) {
			case NodeType.Start:
				n.push({
					id: 'start-' + n.length,
					type: NodeType.Start,
					data: {
						label: 'Process Start'
					} as StartNodeData,
					position
				})
				break
			case NodeType.End:
				n.push({
					id: 'end-' + n.length,
					type: NodeType.End,
					data: {
						label: 'Process End',
						continue: false
					} as EndNodeData,
					position
				})
				break
			case NodeType.Nested:
				n.push({
					id: 'nested-' + n.length,
					type: NodeType.Nested,
					data: {
						label: 'Nested',
						id: ''
					} as NestedNodeData,
					position
				})
				break
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
			case NodeType.Repeater:
				n.push({
					id: 'repeater-' + n.length,
					type: NodeType.Repeater,
					data: {
						label: 'Repeat',
						count: 1
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
