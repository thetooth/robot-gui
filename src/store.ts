import { onMount } from 'svelte'
import { writable, type Writable } from 'svelte/store'

import * as THREE from 'three'
import { connect, JSONCodec } from 'nats.ws'

import type { Status, EventMsg } from './lib/types'

import { dynamicsSelectedPreset, dynamicsPresets } from './lib/types/dynamics'
export { dynamicsSelectedPreset, dynamicsPresets }

export let nc = null
export let js = null
let jc = JSONCodec()
export let ready = false

export let controls = writable({
	x: 0,
	y: 150,
	z: 0,
	r: 0
})

export const dro: Writable<Status> = writable({
	state: 'unknown',
	pose: { x: 0, y: 0, z: 0, r: 0, alpha: 0, beta: 0, phi: 0, theta: 0, alphaVelocity: 0, betaVelocity: 0, phiVelocity: 0, thetaVelocity: 0 },
	otg: { result: -1, kinematicResult: -1 },
	ethercat: { sync0: 0, compensation: 0, integral: 0 }
})

export const events: Writable<EventMsg[]> = writable([])

export const otgStatusTable = new Map([
	[0, 'The trajectory is calculated normally'],
	[1, 'The trajectory has reached its final position'],
	[-1, 'Unclassified error'],
	[-100, 'Error in the input parameter'],
	[-101, 'The trajectory duration exceeds its numerical limits'],
	[-102, 'The trajectory exceeds the given positional limits'],
	[-103, 'The trajectory cannot be phase synchronized'],
	[-104, 'The trajectory is not valid due to a conflict with zero limits'],
	[-110, 'Error during the extremel time calculation (Step 1)'],
	[-111, 'Error during the synchronization calculation (Step 2)']
])
export const kinematicStatusTable = new Map([
	[0, 'The calculation was successful.'],
	[1, 'Kinematics resulted in joint or self collision.'],
	[2, 'Kinematics resulted in a singularity.']
])

export const teachPath = writable([])
export const teachStatus = writable({})
export let playing = writable(false)

let statusSub = null
let eventSub = null
let teachSub = null
let pathSub = null

export async function storeSetup() {
	if (ready) {
		return
	}
	nc = await connect({
		servers: ['ws://192.168.0.107:8000'],
		timeout: 1000
	})
	nc.closed().then(() => {
		ready = false
	})
	js = nc.jetstream()
	ready = true

	statusSub = nc.subscribe('motion.status')
	;(async () => {
		for await (const m of statusSub) {
			// @ts-ignore
			dro.set(jc.decode(m.data))
		}
	})()

	const oc = await js.consumers.get('eventlog')
	;(async () => {
		const messages = await oc.consume()
		for await (const m of messages) {
			events.update((events) => {
				// @ts-ignore
				events.push(jc.decode(m.data))
				return events
			})
			m.ack()
		}
	})()

	// eventSub = nc.subscribe('motion.events')
	// ;(async () => {
	// 	for await (const m of eventSub) {
	// 		// @ts-ignore
	// 		// events.set(jc.decode(m.data))
	// 		events.update((events) => {
	// 			// @ts-ignore
	// 			events.push(jc.decode(m.data))
	// 			return events
	// 		})
	// 	}
	// })()

	teachSub = nc.subscribe('teach.status')
	;(async () => {
		for await (const m of teachSub) {
			// @ts-ignore
			teachStatus.set(jc.decode(m.data))
		}
	})()

	pathSub = nc.subscribe('teach.path')
	;(async () => {
		for await (const m of pathSub) {
			// @ts-ignore
			teachPath.set(jc.decode(m.data))
		}
	})()
}

export async function storeTeardown() {
	if (statusSub != null) {
		await statusSub.unsubscribe()
	}
	if (eventSub != null) {
		await eventSub.unsubscribe()
	}
	if (teachSub != null) {
		await teachSub.unsubscribe()
	}
	if (pathSub != null) {
		await pathSub.unsubscribe()
	}
	if (nc != null) {
		await nc.close()
	}
	ready = false
}

export function start() {
	nc.publish('motion.command', jc.encode({ command: 'start' }))
}
export function stop() {
	nc.publish('motion.command', jc.encode({ command: 'stop' }))
}
export function reset() {
	nc.publish('motion.command', jc.encode({ command: 'reset' }))
}
export function home() {
	nc.publish('motion.command', jc.encode({ command: 'home' }))
}
export function hotStart() {
	nc.publish('motion.command', jc.encode({ command: 'hotStart' }))
}
export function immediate(x, y, z, r) {
	if (nc == null) {
		return
	}
	nc.publish(
		'motion.command',
		jc.encode({
			command: 'goto',
			pose: { x: x, y: y, z: z, r: r }
		})
	)
}
