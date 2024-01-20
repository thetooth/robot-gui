<script>
	import { onMount, onDestroy } from 'svelte'
	import { playing, teachStatus } from './store'
	import { nc, jc } from './client'

	import { Grid, Row, Column, Button } from 'carbon-components-svelte'
	import { Recording, Stop, Play, Erase, Delete, SkipBack, SkipForward, Draw } from 'carbon-icons-svelte'

	let status = {
		state: '',
		mode: '',
		size: 0,
		playhead: 0,
		poses: [{ x: 0, y: 0 }]
	}

	teachStatus.subscribe((s) => {
		status = s
	})

	function record() {
		nc.publish('teach.record', jc.encode(null))
	}
	function stop() {
		playing.set(false)
		nc.publish('teach.stop', jc.encode(null))
	}
	function replay() {
		playing.set(true)
		nc.publish('teach.replay', jc.encode(1))
	}
	function del() {
		nc.publish('teach.delete', jc.encode(null))
	}
	function clear() {
		nc.publish('teach.clear', jc.encode(null))
	}
	function back() {
		nc.publish('teach.back', jc.encode(null))
	}
	function forward() {
		nc.publish('teach.forward', jc.encode(null))
	}
</script>

<br />
<Grid fullWidth noGutter>
	<Row>
		<Column>State:</Column>
		<Column>{status.state}</Column>
		<Column>Mode:</Column>
		<Column>{status.mode}</Column>
	</Row>
	<Row>
		<Column>Playhead</Column>
		<Column>{status.playhead}</Column>
		<Column>Buffer</Column>
		<Column>{status.size}</Column>
	</Row>
</Grid>

<br />
<Button kind="danger" size="field" iconDescription="Record" icon={Recording} on:click={record}></Button>
<Button kind="primary" size="field" iconDescription="Play" icon={Play} on:click={replay}></Button>
<Button kind="secondary" size="field" iconDescription="Stop" icon={Stop} on:click={stop}></Button>
<Button kind="secondary" size="field" iconDescription="Jog Back" icon={SkipBack} on:click={back}></Button>
<Button kind="secondary" size="field" iconDescription="Jog Forward" icon={SkipForward} on:click={forward}></Button>
<Button kind="secondary" size="field" iconDescription="Erase" icon={Erase} on:click={clear}></Button>
<Button kind="secondary" size="field" iconDescription="Delete" icon={Delete} on:click={del}></Button>
