import { writable, type Writable } from 'svelte/store'
import type { EventMsg } from '../types'

export const events: Writable<EventMsg[]> = writable([])
