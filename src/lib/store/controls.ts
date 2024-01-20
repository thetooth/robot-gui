import { writable, type Writable } from 'svelte/store'
import type { Controls } from '../types'

export let controls: Writable<Controls> = writable({
	x: 0,
	y: 150,
	z: 0,
	r: 0
})
