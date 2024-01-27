import { writable, type Writable } from 'svelte/store'
import { type Node, type Edge, type Viewport } from '@xyflow/svelte'

const position = { x: 0, y: 0 }
const edgeType = 'smoothstep'

export const initialNodes: Node[] = [
	{ position, id: '1', type: 'start', data: { label: 'Process Start' } },
	{ position, id: '2', type: 'selector', data: { label: 'Selector', count: 2 } },
	{ position, id: '3', type: 'sequence', data: { label: 'Sequence', count: 3 } },
	{ position, id: '2a', type: 'moveTo', data: { label: 'Move to', pose: { x: 0, y: 150, z: 0, r: 0 } } },
	{ position, id: '2b', type: 'moveTo', data: { label: 'Move to', pose: { x: 200, y: 150, z: 80, r: 0 } } },
	{ position, id: '2c', type: 'condition', data: { label: 'Condition 2' } },
	{ position, id: '2d', type: 'end', data: { label: 'Process End', continue: true } },
	{ position, id: '4', type: 'condition', data: { label: 'Condition 1' } }
]

export const initialEdges: Edge[] = [
	{ type: edgeType, animated: true, id: 'xy-edge__1-2', source: '1', target: '2' },
	{ type: edgeType, animated: true, id: 'xy-edge__21-3', source: '2', sourceHandle: '1', target: '3' },
	{ type: edgeType, animated: true, id: 'xy-edge__31-2a', source: '3', sourceHandle: '1', target: '2a' },
	{ type: edgeType, animated: true, id: 'xy-edge__32-2b', source: '3', sourceHandle: '2', target: '2b' },
	{ type: edgeType, animated: true, id: 'xy-edge__33-2c', source: '3', sourceHandle: '3', target: '2c' },
	{ type: edgeType, animated: true, id: 'xy-edge__2c-2d', source: '2c', target: '2d' },
	{ type: edgeType, animated: true, id: 'xy-edge__22-4', source: '2', sourceHandle: '2', target: '4' },
	{ type: edgeType, animated: true, id: 'xy-edge__4-2d', source: '4', target: '2d' }
]

export const nodes: Writable<Node[]> = writable()
export const edges: Writable<Edge[]> = writable()

const storedNodes = localStorage.getItem('behaviorTree.nodes')
if (storedNodes) {
	nodes.set(JSON.parse(storedNodes))
}
nodes.subscribe((value) => {
	if (value.length === 0) return
	localStorage.setItem('behaviorTree.nodes', JSON.stringify(value))
})
const storedEdges = localStorage.getItem('behaviorTree.edges')
if (storedEdges) {
	edges.set(JSON.parse(storedEdges))
}
edges.subscribe((value) => {
	if (value.length === 0) return
	localStorage.setItem('behaviorTree.edges', JSON.stringify(value))
})
