import type { Pose } from './pose'

export interface TeachStatus {
	state: string
	mode: string
	size: number
	playhead: number
	poses: Pose[]
}

export type TeachPath = Pose[]
