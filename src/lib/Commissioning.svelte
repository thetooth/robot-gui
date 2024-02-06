<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { controls, dro } from './store'
	import { immediate, reset } from './client'

	import { Grid, Row, Column, Button, Slider, FormGroup, ComposedModal, ModalHeader, ModalBody, ModalFooter, Toggle } from 'carbon-components-svelte'

	let hot = false

	const controlsUnsubscribe = controls.subscribe((data) => {
		if (hot) {
			immediate(data.x, data.y, data.z, data.r)
		}
	})

	function placeHere() {
		$controls.x = Math.round($dro.pose.x)
		$controls.y = Math.round($dro.pose.y)
		$controls.z = Math.round($dro.pose.z)
		$controls.r = Math.round($dro.pose.r)
	}

	onMount(async () => {
		console.log('Commissioning UI is mounted')
		placeHere()
		if (!$dro.run) {
			immediate($controls.x, $controls.y, $controls.z, $controls.r)
		}
	})

	onDestroy(() => {
		controlsUnsubscribe()
		console.log('Commissioning UI is unmounted')
	})
</script>

<h4>Current Position</h4>
<Grid fullWidth noGutter padding>
	<Row>
		<Column lg={1} md={2}>X</Column>
		<Column lg={6} md={6}>{$dro.pose.x.toFixed(3)}mm</Column>
		<Column lg={1} md={2}>Z</Column>
		<Column lg={6} md={6}>{$dro.pose.z.toFixed(3)}mm</Column>
	</Row>
	<Row>
		<Column lg={1} md={2}>Y</Column>
		<Column lg={6} md={6}>{$dro.pose.y.toFixed(3)}mm</Column>
		<Column lg={1} md={2}>R</Column>
		<Column lg={6} md={6}>{$dro.pose.r.toFixed(3)}&deg;</Column>
	</Row>
</Grid>
<h4>Controls</h4>
<FormGroup>
	<Toggle labelText="Activate Controls" size="sm" on:toggle={(e) => (hot = e.detail.toggled)} />
	<br />
	<Slider labelText="X" fullWidth min={-400} max={400} step={1} bind:value={$controls.x} disabled={!hot} />
	<Slider labelText="Y" fullWidth min={-400} max={400} step={1} bind:value={$controls.y} disabled={!hot} />
	<Slider labelText="Z" fullWidth min={0} max={150} step={1} bind:value={$controls.z} disabled={!hot} />
	<Slider labelText="R" fullWidth min={-180} max={180} step={1} bind:value={$controls.r} disabled={!hot} />
	<Button kind="ghost" size="small" on:click={placeHere}>Set Cursor Here</Button>
	<Button kind="danger-ghost" size="small" on:click={reset} disabled={$dro.run}>Reset</Button>
</FormGroup>
