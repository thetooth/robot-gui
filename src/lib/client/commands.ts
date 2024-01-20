import { nc, jc } from './nc'

export function start() {
	nc.publish('motion.command', jc.encode({ command: 'start' }))
}
export function stop() {
	nc.publish('motion.command', jc.encode({ command: 'stop' }))
}
export function reset() {
	nc.publish('motion.command', jc.encode({ command: 'reset' }))
}
export function home() {
	nc.publish('motion.command', jc.encode({ command: 'home' }))
}
export function hotStart() {
	nc.publish('motion.command', jc.encode({ command: 'hotStart' }))
}
export function immediate(x, y, z, r) {
	if (nc == null) {
		return
	}
	nc.publish(
		'motion.command',
		jc.encode({
			command: 'goto',
			pose: { x: x, y: y, z: z, r: r }
		})
	)
}
