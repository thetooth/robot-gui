import { writable, type Writable } from 'svelte/store'
import { type Node, type Edge, type Viewport } from '@xyflow/svelte'
import type { Behaviour } from '.'

const position = { x: 0, y: 0 }
const edgeType = 'smoothstep'

export const newNodes: Node[] = [
	{ position, id: '1', type: 'start', data: { label: 'Process Start' } },
	{ position, id: '2', type: 'end', data: { label: 'Process End', continue: true } }
]
export const newEdges: Edge[] = []

export const behaviour: Writable<Behaviour> = writable({
	id: crypto.randomUUID(),
	name: 'New Behaviour',
	description: ''
})
export const nodes: Writable<Node[]> = writable([])
export const edges: Writable<Edge[]> = writable([])

const storedBehaviour = localStorage.getItem('bt.behaviour')
if (storedBehaviour) {
	behaviour.set(JSON.parse(storedBehaviour))
}
behaviour.subscribe((value) => {
	if (!value) return
	localStorage.setItem('bt.behaviour', JSON.stringify(value))
})
const storedNodes = localStorage.getItem('bt.nodes')
if (storedNodes) {
	nodes.set(JSON.parse(storedNodes))
}
nodes.subscribe((value) => {
	if (value.length === 0) return
	localStorage.setItem('bt.nodes', JSON.stringify(value))
})
const storedEdges = localStorage.getItem('bt.edges')
if (storedEdges) {
	edges.set(JSON.parse(storedEdges))
}
edges.subscribe((value) => {
	if (value.length === 0) return
	localStorage.setItem('bt.edges', JSON.stringify(value))
})
