export interface Pose {
	x: number
	y: number
	z: number
	r: number
	alpha?: number
	beta?: number
	phi?: number
	theta?: number
	alphaVelocity?: number
	betaVelocity?: number
	phiVelocity?: number
	thetaVelocity?: number
}

export interface Controls {
	x: number
	y: number
	z: number
	r: number
}
