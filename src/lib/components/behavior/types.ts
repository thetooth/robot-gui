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
	Selector = 'selector',
	Sequence = 'sequence',
	Condition = 'condition',
	MoveTo = 'moveTo'
}

export interface NodeData {
	label: string
}

export interface StartNodeData extends NodeData {}

export interface EndNodeData extends NodeData {
	continue: boolean
}

export interface SelectorNodeData extends NodeData {
	count: number
}

export interface SequenceNodeData extends NodeData {
	count: number
	activeTask: number
}

export interface ConditionNodeData extends NodeData {}

export interface MoveToNodeData extends NodeData {
	pose: Pose
}
