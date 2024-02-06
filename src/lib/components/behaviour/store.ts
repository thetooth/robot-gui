import { writable, type Writable } from 'svelte/store'
import { type Node, type Edge, type Viewport } from '@xyflow/svelte'
import type { Behaviour, BehaviourStatus } from '.'

const position = { x: 0, y: 0 }
const edgeType = 'smoothstep'

export const newNodes: Node[] = [
	{ position, id: 'start-1', type: 'start', data: { label: 'Process Start' } },
	{ position, id: 'end-2', type: 'end', data: { label: 'Process End', continue: true } }
]
export const newEdges: Edge[] = []

export const keys: Writable<Map<string, string>> = writable(new Map())
export const behaviour: Writable<Behaviour> = writable({
	id: crypto.randomUUID(),
	name: 'New Behaviour',
	description: ''
})
export const localRev: Writable<number> = writable(0)
export const serverRev: Writable<number> = writable(0)
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

const storedLocalRev = localStorage.getItem('bt.localRevision')
if (storedLocalRev) {
	localRev.set(JSON.parse(storedLocalRev))
}
localRev.subscribe((value) => {
	localStorage.setItem('bt.localRevision', JSON.stringify(value))
})
const storedServerRev = localStorage.getItem('bt.serverRevision')
if (storedServerRev) {
	serverRev.set(JSON.parse(storedServerRev))
}
serverRev.subscribe((value) => {
	localStorage.setItem('bt.serverRevision', JSON.stringify(value))
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

export const behaviourStatus: Writable<BehaviourStatus> = writable({
	id: '',
	name: '',
	revision: 0,
	run: false,
	alarm: false,
	lastFault: '',
	nodes: []
})
