import { connect, JSONCodec, type JetStreamClient, type NatsConnection, type Subscription } from 'nats.ws'

import type { Status, EventMsg } from '../types'
import { dro, events, teachPath, teachStatus } from '../store'
import { writable, type Writable, get } from 'svelte/store'

export let nc: NatsConnection
export let js: JetStreamClient
export let jc = JSONCodec()
export const ready: Writable<boolean> = writable(false)

let statusSub: Subscription
let eventSub: Subscription
let teachSub: Subscription
let pathSub: Subscription

export async function storeSetup() {
	if (get(ready) || nc != null) {
		return
	}
	try {
		nc = await connect({
			servers: ['ws://192.168.0.107:8000'],
			timeout: 1000
		})
	} catch (err) {
		events.update((e) => {
			e.push({
				id: crypto.randomUUID(),
				time: Date.now() * 1000000,
				level: 'error',
				msg: 'Failed to connect to message broker',
				detail: err
			})
			return e
		})
		setTimeout(storeSetup, 5000)
		return
	}
	nc.closed().then(() => {
		ready.set(false)
		storeTeardown()
		setTimeout(storeSetup, 5000)
	})
	js = nc.jetstream()
	ready.set(true)

	statusSub = nc.subscribe('motion.status')
	;(async () => {
		for await (const m of statusSub) {
			dro.set(jc.decode(m.data) as Status)
		}
	})()

	const oc = await js.consumers.get('eventlog')
	;(async () => {
		const messages = await oc.consume()
		for await (const m of messages) {
			events.update((events) => {
				events.push(jc.decode(m.data) as EventMsg)
				return events
			})
			m.ack()
		}
	})()

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
	ready.set(false)
}
