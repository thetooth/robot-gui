import { writable, type Writable } from 'svelte/store'
import type { Status } from '../types'

export const dro: Writable<Status> = writable({
	state: 'unknown',
	pose: { x: 0, y: 150, z: 0, r: 0, alpha: 0, beta: 0, phi: 0, theta: 0, alphaVelocity: 0, betaVelocity: 0, phiVelocity: 0, thetaVelocity: 0 },
	drives: [],
	otg: { result: -1, kinematicResult: -1 },
	ethercat: { sync0: 0, compensation: 0, integral: 0 }
})
