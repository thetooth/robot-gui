import { setContext, getContext } from 'svelte'
import { writable, type Writable } from 'svelte/store'

import { type ChartOptions, type LineOptions } from './types'

export function setChartContext() {
	const chartContext: Writable<ChartOptions> = writable({
		length: 0
	})
	setContext('chart', chartContext)
}
export function getChartContext(): Writable<ChartOptions> {
	return getContext('chart')
}

export function setLineContext() {
	const lineContext: Writable<Map<number, LineOptions>> = writable(new Map())
	setContext('line', lineContext)
}
export function getLineContext(): Writable<Map<number, LineOptions>> {
	return getContext('line')
}
