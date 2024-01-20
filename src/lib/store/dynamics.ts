import { writable, type Writable } from 'svelte/store'
import type { Preset } from '../types'

export let dynamicsPresets: Writable<Preset[]> = writable([
	{
		name: 'Default',
		data: [
			{
				'max-velocity': 600.0,
				'max-acceleration': 2500.0,
				'max-jerk': 10000.0
			},
			{
				'max-velocity': 600.0,
				'max-acceleration': 2500.0,
				'max-jerk': 10000.0
			},
			{
				'max-velocity': 4000.0,
				'max-acceleration': 400000.0,
				'max-jerk': 1000000.0
			},
			{
				'max-velocity': 4000.0,
				'max-acceleration': 400000.0,
				'max-jerk': 1000000.0
			}
		]
	},
	{
		name: 'Slow',
		data: [
			{
				'max-velocity': 10,
				'max-acceleration': 10,
				'max-jerk': 10000
			},
			{
				'max-velocity': 10,
				'max-acceleration': 10,
				'max-jerk': 10000
			},
			{
				'max-velocity': 1000,
				'max-acceleration': 100,
				'max-jerk': 10000
			},
			{
				'max-velocity': 1000,
				'max-acceleration': 2500,
				'max-jerk': 10000
			}
		]
	}
])
export const dynamicsSelectedPreset = writable('Default')

const storedPresets = localStorage.getItem('dynamicsPresets')
if (storedPresets) {
	dynamicsPresets.set(JSON.parse(storedPresets))
}
dynamicsPresets.subscribe((value) => {
	localStorage.setItem('dynamicsPresets', JSON.stringify(value))
})

const storedSelectedPreset = localStorage.getItem('dynamicsSelectedPreset')
if (storedSelectedPreset) {
	dynamicsSelectedPreset.set(storedSelectedPreset)
}
dynamicsSelectedPreset.subscribe((value) => {
	localStorage.setItem('dynamicsSelectedPreset', value)
})
