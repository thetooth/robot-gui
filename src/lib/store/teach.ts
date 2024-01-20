import { writable, type Writable } from 'svelte/store'
import type { TeachPath, TeachStatus } from '../types'

export const teachPath: Writable<TeachPath> = writable([])
export const teachStatus: Writable<TeachStatus> = writable({
	state: 'unknown',
	mode: 'unknown',
	size: 0,
	playhead: 0,
	poses: []
})
export let playing = writable(false)
