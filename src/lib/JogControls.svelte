<script>
	import { nc, jc } from './client'

	import { Grid, Row, Column, Button } from 'carbon-components-svelte'
	import { ChevronSortUp, ChevronSortDown } from 'carbon-icons-svelte'

	function alphaUp() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { alpha: 100 } }))
	}
	function alphaDown() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { alpha: -1 } }))
	}
	function betaUp() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { beta: 1 } }))
	}
	function betaDown() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { beta: -1 } }))
	}
	function phiUp() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { phi: 1 } }))
	}
	function phiDown() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { phi: -1 } }))
	}
	function thetaUp() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { theta: 1 } }))
	}
	function thetaDown() {
		nc.publish('motion.command', jc.encode({ command: 'jog', jog: { theta: -1 } }))
	}
</script>

<Grid fullWidth noGutter>
	<Row>
		<Column>Alpha</Column>
		<Column>Phi</Column>
	</Row>
	<Row>
		<Column
			><Button kind="danger" size="field" iconDescription="Jog Positive" icon={ChevronSortUp} on:click={alphaUp}>Positive</Button>
			<Button kind="danger" size="field" iconDescription="Jog Negative" icon={ChevronSortDown} on:click={alphaDown}>Negative</Button></Column
		>
		<Column
			><Button kind="danger" size="field" iconDescription="Jog Positive" icon={ChevronSortUp} on:click={phiUp}>Positive</Button>
			<Button kind="danger" size="field" iconDescription="Jog Negative" icon={ChevronSortDown} on:click={phiDown}>Negative</Button></Column
		>
	</Row>
	<Row>
		<Column>Beta</Column>
		<Column>Theta</Column>
	</Row>
	<Row>
		<Column
			><Button kind="danger" size="field" iconDescription="Jog Positive" icon={ChevronSortUp} on:click={betaUp}>Positive</Button>
			<Button kind="danger" size="field" iconDescription="Jog Negative" icon={ChevronSortDown} on:click={betaDown}>Negative</Button></Column
		>
		<Column
			><Button kind="danger" size="field" iconDescription="Jog Positive" icon={ChevronSortUp} on:click={thetaUp}>Positive</Button>
			<Button kind="danger" size="field" iconDescription="Jog Negative" icon={ChevronSortDown} on:click={thetaDown}>Negative</Button></Column
		>
	</Row>
</Grid>
