<script>
	import { onMount, onDestroy } from 'svelte'
	import { JSONCodec } from 'nats.ws'
	import { nc, dro, dynamicsSelectedPreset, dynamicsPresets } from '../store'

	import { Content, Grid, Row, Column, FormGroup, NumberInput, Select, SelectItem, Toggle, Button } from 'carbon-components-svelte'

	const jc = JSONCodec()
	let overridden = false
	let running = false
	let axisNames = ['J1', 'J2', 'J3/Z', 'J4/R']

	$: {
		running = $dro.run && !overridden
	}

	function motionSettings() {
		let settings = $dynamicsPresets.find((p) => p.name === $dynamicsSelectedPreset).data
		nc.publish('motion.settings', jc.encode(settings))
	}

	function loadPreset() {
		const preset = $dynamicsPresets.find((p) => p.name === $dynamicsSelectedPreset)
		if (preset) {
			motionSettings()
		}
	}

	function exportPresets() {
		const data = JSON.stringify($dynamicsPresets)
		const blob = new Blob([data], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'dynamics-presets.json'
		a.click()
	}

	function importPresets() {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'application/json'
		input.onchange = (e) => {
			// @ts-ignore
			const file = e.target.files[0]
			const reader = new FileReader()
			reader.onload = (e) => {
				// @ts-ignore
				const data = JSON.parse(e.target.result)
				dynamicsPresets.set(data)
				loadPreset()
			}
			reader.readAsText(file)
		}
		input.click()
	}

	onMount(async () => {
		console.log('Dynamics UI is mounted')

		loadPreset()
	})
</script>

<Content>
	<h2>Joint Dynamics</h2>

	<FormGroup>
		<Select labelText="Presets" bind:selected={$dynamicsSelectedPreset} disabled={running} on:change={loadPreset}>
			{#each $dynamicsPresets as preset}
				<SelectItem value={preset.name}>{preset.name}</SelectItem>
			{/each}
		</Select>
	</FormGroup>
	<FormGroup>
		<Button kind="primary" size="field" on:click={importPresets} disabled={running}>Import</Button>
		<Button kind="secondary" size="field" on:click={exportPresets} disabled={running}>Export</Button>
	</FormGroup>
	<FormGroup>
		<Grid fullWidth noGutter padding>
			{#each $dynamicsPresets.find((p) => p.name === $dynamicsSelectedPreset).data as axis, i}
				<Row>
					<Column lg={1}>{axisNames[i]}</Column>
					<Column lg={5}>
						<NumberInput label="Velocity" bind:value={axis['max-velocity']} disabled={running} min={10} max={1000000} step={1} on:change={motionSettings} />
					</Column>
					<Column lg={5}>
						<NumberInput label="Acceleration" bind:value={axis['max-acceleration']} disabled={running} min={10} max={1000000} step={1} on:change={motionSettings} />
					</Column>
					<Column lg={5}>
						<NumberInput label="Jerk" bind:value={axis['max-jerk']} disabled={running} min={10} max={1000000} step={1} on:change={motionSettings} />
					</Column>
				</Row>
			{/each}
		</Grid>
	</FormGroup>
	<FormGroup>
		<Toggle labelText="Force online changes" on:toggle={(e) => (overridden = e.detail.toggled)} />
	</FormGroup>
</Content>
