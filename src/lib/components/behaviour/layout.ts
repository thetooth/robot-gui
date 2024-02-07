import { Position, type Node, type Edge } from '@xyflow/svelte'
import ELK from 'elkjs/lib/elk.bundled.js'
import type { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk-api.js'

const elk = new ELK()
// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
	'elk.algorithm': 'mrtree', //'mrtree',
	'elk.direction': 'RIGHT',
	'elk.mrtree.weighting': 'CONSTRAINT',
	// 'elk.mrtree.positionConstraint': '1',
	'elk.mrtree.edgeRoutingMode': 'AVOID_OVERLAP',
	'elk.mrtree.searchOrder': 'BFS',
	'elk.spacing.edgeNode': '80',
	'elk.spacing.nodeNode': '80',
	'elk.mrtree.compaction': 'true'
}

const nodeWidth = 180 //172
const nodeHeight = 40 //34

export function calculateNodeSizes(nodes: Node[]): Node[] {
	nodes.forEach((node) => {
		node.width = nodeWidth
		switch (node.type) {
			case 'moveTo':
			case 'pickUp':
				node.height = 80
				break
			case 'selector':
			case 'sequence':
				// Calculate the height of the sequence node based on the number of outputs
				node.height = node.data?.count * nodeHeight + 40
				break
			default:
				// node.width = nodeWidth
				node.height = nodeHeight
				break
		}
	})
	return nodes
}

export function layoutNodes(nodes: Node[], edges: Edge[]) {
	if (!nodes || !edges) {
		return Promise.resolve({ nodes: [], edges: [] })
	}

	const graph = {
		id: 'root',
		layoutOptions: elkOptions,
		children: nodes.map((node) => {
			return {
				...node,
				// Adjust the target and source handle positions based on the layout
				// direction.
				targetPosition: Position.Left,
				sourcePosition: Position.Right,

				// Set the width and height of the nodes if available
				width: node.width || nodeWidth,
				height: node.height || nodeHeight,
				// Give elk a hint about which nodes should be at which level
				layoutOptions: {
					positionConstraint: node.position.y.toFixed(0).toString() || '1',
					priority: node.type === 'start' ? '2' : '1'
				}
			} as ElkNode
		}),
		edges: edges.map((edge) => {
			edge.animated = true
			edge.type = 'smoothstep'
			return {
				...edge,
				sources: [edge.source],
				targets: [edge.target]
			} as ElkExtendedEdge
		})
	}

	return elk
		.layout(graph)
		.then((layedOutGraph) => ({
			nodes: layedOutGraph.children.map((node) => ({
				...node,
				// React Flow expects a position property on the node instead of `x`
				// and `y` fields.
				position: { x: node.x, y: node.y }
			})),

			edges: layedOutGraph.edges
		}))
		.catch(console.error)
}
