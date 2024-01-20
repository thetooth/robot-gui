import { readable, writable, type Writable } from 'svelte/store'

export type Dynamics = {
	'max-velocity': number
	'max-acceleration': number
	'max-jerk': number
}

export type Preset = {
	name: string
	data: Dynamics[]
}
