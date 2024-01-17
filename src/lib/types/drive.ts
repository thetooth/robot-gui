export type DriveStatus = {
	slaveID: number
	controlWord: number
	statusWord: number
	errorCode: number
	fault: boolean
	lastFault: number
	followingError: number
	actualTorque: number
}
