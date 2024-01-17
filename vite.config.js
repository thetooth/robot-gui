import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { optimizeImports } from 'carbon-preprocess-svelte'
import sveltePreprocess from 'svelte-preprocess'

// https://vitejs.dev/config/
export default defineConfig({
	optimizeDeps: {
		exclude: ['carbon-components-svelte']
	},
	plugins: [
		svelte({
			configFile: './svelte.config.js',
			preprocess: [sveltePreprocess({}), optimizeImports()]
		})
	]
})
