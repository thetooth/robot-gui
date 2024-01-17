import 'carbon-components-svelte/css/all.css'
import '@carbon/charts-svelte/styles.css'
import './app.scss'
import App from './App.svelte'

const app = new App({
	target: document.getElementById('app')
})

export default app
