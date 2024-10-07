import { type Pose } from '../../types'

export interface ContextMenuEvent {
	target: string
	position: {
		x: number
		y: number
	}
}

export enum NodeType {
	Start = 'start',
	End = 'end',
	Nested = 'nested',
	Selector = 'selector',
	Sequence = 'sequence',
	Repeater = 'repeater',
	Condition = 'condition',
	Delay = 'delay',
	MoveTo = 'moveTo',
	PickUp = 'pickUp'
}

export interface NodeData {
	label: string
}

export interface StartNodeData extends NodeData {}

export interface EndNodeData extends NodeData {
	continue: boolean
}

export interface NestedNodeData extends NodeData {
	id: string
}

export interface SelectorNodeData extends NodeData {
	count: number
}

export interface SequenceNodeData extends NodeData {
	count: number
	activeTask: number
}

export interface RepeaterNodeData extends NodeData {
	count: number
}

export interface ConditionNodeData extends NodeData {
	expression: string
}

export interface DelayNodeData extends NodeData {
	delay: number
}

export interface MoveToNodeData extends NodeData {
	pose: Pose
}

export interface PickUpNodeData extends NodeData {
	height: number
}

export interface StoreNode {
	id: string
	type: NodeType
	data: NodeData
	width: number
	height: number
	position: {
		x: number
		y: number
	}
}

export interface StoreEdge {
	id: string
	source: string
	sourceHandle?: string
	target: string
}

export interface Behaviour {
	id: string
	name: string
	description: string
	nodes?: StoreNode[]
	edges?: StoreEdge[]
}

export enum NodeStatusType {
	Invalid,
	Success,
	Failure,
	Running,
	Unknown
}

export interface NodeStatus {
	id: string
	status: NodeStatusType
}

export interface BehaviourStatus {
	id: string
	name: string
	revision: number
	run: boolean
	alarm: boolean
	lastFault: string
	nodes: NodeStatus[]
}
