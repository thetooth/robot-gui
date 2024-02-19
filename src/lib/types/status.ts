import type { Pose } from './pose'
import type { DriveStatus } from './drive'
import type { OTGStatus } from './otg'
import type { EtherCATStatus } from './ethercat'

export interface Status {
	run?: boolean
	estop?: boolean
	state: string
	alarm?: boolean
	needsHoming?: boolean
	pose: Pose
	drives?: DriveStatus[]
	otg: OTGStatus
	ethercat: EtherCATStatus
}
