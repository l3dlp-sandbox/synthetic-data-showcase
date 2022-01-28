/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { IStackStyles, IStackTokens, Stack } from '@fluentui/react'
import { memo } from 'react'
import { IEvaluateResult } from 'sds-wasm'
import {
	useEvaluationMetrics,
	useMetricsByCountLabels,
	useMetricsByLenLabels,
} from './hooks'
import { MetricsChart } from '~components/Charts'
import { DownloadButton } from '~components/controls/DownloadButton'

export interface SensitiveDataChartsProps {
	evaluateResult: IEvaluateResult
	chartHeight: number
	chartWidth: number
	chartStackStyles?: IStackStyles
	chartStackTokens?: IStackTokens
	chartStackItemStyles?: IStackStyles
}

export const SensitiveDataCharts: React.FC<SensitiveDataChartsProps> = memo(
	function SensitiveDataCharts({
		evaluateResult,
		chartHeight,
		chartWidth,
		chartStackStyles,
		chartStackTokens,
		chartStackItemStyles,
	}: SensitiveDataChartsProps) {
		const lenLabels = useMetricsByLenLabels(evaluateResult)
		const countLabels = useMetricsByCountLabels(evaluateResult)
		const evaluationMetrics = useEvaluationMetrics(
			lenLabels,
			countLabels,
			evaluateResult,
		)

		return (
			<>
				<Stack horizontal tokens={chartStackTokens}>
					<h3>Sensitive data charts</h3>
					<Stack.Item align="center">
						<DownloadButton
							title="Download sensitive analysis by length CSV"
							label="Analysis by length"
							onGetDownloadInfo={async () => undefined}
						/>
					</Stack.Item>
				</Stack>
				<Stack
					horizontal
					wrap
					styles={chartStackStyles}
					tokens={chartStackTokens}
				>
					<Stack.Item styles={chartStackItemStyles}>
						<MetricsChart
							labels={lenLabels}
							leftChart={{
								label: 'Mean sensitive count by length',
								metrics: evaluationMetrics.meanSensitiveCombinationCountByLen,
								type: 'bar',
							}}
							height={chartHeight}
							width={chartWidth}
						/>
					</Stack.Item>
					<Stack.Item styles={chartStackItemStyles}>
						<MetricsChart
							labels={lenLabels}
							leftChart={{
								label: 'Rare combinations percentages by length',
								metrics:
									evaluationMetrics.rareSensitiveCombinationsPercentageByLen,
								type: 'line',
								max: 100,
								drawYAxisOnChartArea: false,
							}}
							rightChart={{
								label: 'Unique combinations by length',
								metrics:
									evaluationMetrics.numberOfDistinctSensitiveCombinationsByLen,
								type: 'bar',
							}}
							height={chartHeight}
							width={chartWidth}
						/>
					</Stack.Item>
				</Stack>
			</>
		)
	},
)
