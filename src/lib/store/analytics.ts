import { writable, type Writable } from 'svelte/store'

export const selectedAnalyticsView: Writable<string> = writable('ethercat')
const storedAnalyticsView = localStorage.getItem('selectedAnalyticsView')
if (storedAnalyticsView) {
	selectedAnalyticsView.set(storedAnalyticsView)
}
selectedAnalyticsView.subscribe((value) => {
	localStorage.setItem('selectedAnalyticsView', value)
})
