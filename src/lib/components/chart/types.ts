import { CircularBuffer } from 'cirbuf'
import { type LineStrip } from 'candygraph'

export type LineOptions = {
	color: string
	points: CircularBuffer<any>
}

export type ChartOptions = {
	length: number
}
