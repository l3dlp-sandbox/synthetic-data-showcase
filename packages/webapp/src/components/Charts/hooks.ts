/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useThematic } from '@thematic/react'
import { _DeepPartialObject } from 'chart.js/types/utils'
import { Options } from 'chartjs-plugin-datalabels/types/options'
import { BaseSyntheticEvent, useCallback, useMemo, WheelEvent } from 'react'
import {
	BarColors,
	useActualBarChartColors,
	useEstimatedBarChartColors,
} from '~components/AttributeIntersectionValueChartLegend'
/*
	this module contains hooks for chart colors and such that may not be covered in thedefault ChartContext
 */

// we don't have types imported,
// this provides a subset as needed
// see, e.g. https://www.chartjs.org/docs/latest/charts/bar.html
export interface ChartJsDatasetConfig {
	type: 'bar'
	backgroundColor?: string | string[]
}

export interface DataLabelsConfig {
	datalabels?: _DeepPartialObject<Options>
}

function useBarConfig(
	colors: BarColors,
	items: string[],
	selectedValue?: string,
): ChartJsDatasetConfig {
	return useMemo(() => {
		console.log(selectedValue)
		const backgroundColor = items.map(i => {
			if (selectedValue) {
				return i === selectedValue ? colors.selected : colors.suppressed
			}
			return colors.normal
		})
		return {
			type: 'bar',
			backgroundColor: backgroundColor.length > 0 ? backgroundColor : undefined,
		}
	}, [colors, items, selectedValue])
}

export function useActualBarConfig(
	items: string[],
	selectedValue?: string,
): ChartJsDatasetConfig {
	const colors = useActualBarChartColors()
	return useBarConfig(colors, items, selectedValue)
}

export function useEstimatedBarConfig(
	items: string[],
	selectedValue?: string,
): ChartJsDatasetConfig {
	const colors = useEstimatedBarChartColors()
	return useBarConfig(colors, items, selectedValue)
}

export function useDataLabelsConfig(
	items: string[],
	selectedValue?: string,
): DataLabelsConfig {
	const thematic = useThematic()
	return useMemo(() => {
		const greys = thematic.scales().greys().toArray()
		return {
			datalabels: {
				anchor: 'start',
				align: 'end',
				offset: 5,
				color: items.map(item =>
					item === selectedValue ? greys[0] : greys[80],
				),
			},
		}
	}, [thematic, items, selectedValue])
}

export function useHorizontalScrolling(): (e: WheelEvent<HTMLElement>) => void {
	return useCallback((e: WheelEvent<HTMLElement>) => {
		e.stopPropagation()
		e.currentTarget.scrollTo({
			left: e.currentTarget.scrollLeft + e.deltaY,
		})
	}, [])
}

export function useStopPropagation(): (e: BaseSyntheticEvent) => void {
	return useCallback((e: BaseSyntheticEvent) => {
		e.stopPropagation()
	}, [])
}
