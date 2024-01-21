import { CircularBuffer } from 'cirbuf'
import { type LineStrip } from 'candygraph'
import { type RGBColor } from 'd3-color'

export type LineOptions = {
	color: RGBColor
	width: number
	points: CircularBuffer<any>
}

export type ChartOptions = {
	length: number
}
