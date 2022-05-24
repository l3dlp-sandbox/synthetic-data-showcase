/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useCallback, useMemo } from 'react'
import type { IInputNumberByLength } from 'sds-wasm'

import type { ICsvContent, IRawSynthesisParameters } from '~models'
import {
	AccuracyMode,
	FabricationMode,
	OversamplingType,
	UseSyntheticCounts,
} from '~models'
import { useSdsManagerInstance, useSensitiveContentValue } from '~states'
import { namedSpread, spreadableHeaders, usableHeaders } from '~utils'
import type {
	IAggregateSeededSynthesisParameters,
	IDpSynthesisParameters,
	ISynthesisParameters,
	IValueSeededSynthesisParameters,
} from '~workers/types'
import { SynthesisMode } from '~workers/types'

export function generateContextKey(params: IRawSynthesisParameters): string {
	switch (params.synthesisMode) {
		case SynthesisMode.Unseeded:
		case SynthesisMode.RowSeeded:
			return `K-Anonymity ${params.synthesisMode} (RecordLimit=${params.recordLimit}, PrivacyResolution=${params.resolution}, AggregationLimit=${params.reportingLength})`
		case SynthesisMode.ValueSeeded:
			return (
				`K-Anonymity ${params.synthesisMode} (RecordLimit=${params.recordLimit}, PrivacyResolution=${params.resolution}, AggregationLimit=${params.reportingLength}, Oversampling=${params.oversamplingType}` +
				(params.oversamplingType === OversamplingType.Unlimited
					? ')'
					: `, OversamplingRatio=${params.oversamplingRatio}, OversamplingTries=${params.oversamplingTries})`)
			)
		case SynthesisMode.AggregateSeeded:
			return `K-Anonymity ${params.synthesisMode} (RecordLimit=${params.recordLimit}, PrivacyResolution=${params.resolution}, AggregationLimit=${params.reportingLength}, UseSyntheticCounts=${params.aggregateSeededUseSyntheticCounts})`
		case SynthesisMode.DP:
			return `Differential Privacy (RecordLimit=${
				params.recordLimit
			}, PrivacyResolution=${params.resolution}, AggregationLimit=${
				params.reportingLength
			}, UseSyntheticCounts=${
				params.dpAggregateSeededUseSyntheticCounts
			}, Percentile=${params.percentilePercentage}, PercentileEpsilonProp=${
				params.percentileEpsilonProportion
			}, Epsilon=${params.noiseEpsilon}, DeltaFactor=${
				params.deltaFactor
			}, FabricationMode=(${params.fabricationMode}, [${Object.values(
				params.threshold,
			).join(',')}]), AccuracyMode=${params.accuracyMode})`
	}
}

function generateSigmaProportions(
	reportingLength: number,
	accuracyMode: AccuracyMode,
): number[] {
	const sigmaProportions: number[] = []

	for (let i = 0; i < reportingLength; i++) {
		let p
		switch (accuracyMode) {
			case AccuracyMode.Balanced:
				p = 1.0
				break
			case AccuracyMode.PrioritizeLargeCounts:
				p = 1.0 / (i + 1)
				break
			case AccuracyMode.PrioritizeSmallCounts:
				p = 1.0 / (reportingLength - i)
				break
		}
		sigmaProportions.push(p)
	}
	return sigmaProportions
}

function generateNoisyThresholdValuesByLen(
	fabricationMode: FabricationMode,
	threshold: IInputNumberByLength,
	reportingLength: number,
): IInputNumberByLength {
	let ret = {}

	switch (fabricationMode) {
		case FabricationMode.Balanced:
			if (reportingLength === 2) {
				ret[2] = 0.1
			} else {
				const ratio = 0.9 / (reportingLength - 2)
				for (let i = 2; i <= reportingLength; ++i) {
					ret[i] = Math.min(0.1 + ratio * (i - 2), 1.0)
				}
			}
			break
		case FabricationMode.Minimize:
			for (let i = 2; i <= reportingLength; ++i) {
				ret[i] = 0.01
			}
			break
		case FabricationMode.Uncontrolled:
			for (let i = 2; i <= reportingLength; ++i) {
				ret[i] = 1.0
			}
			break
		case FabricationMode.Custom:
			ret = threshold
			break
	}
	return ret
}

function convertRawToSynthesisParameters(
	rawParams: IRawSynthesisParameters,
	useColumns: string[],
	sensitiveCsvContent: ICsvContent,
): ISynthesisParameters {
	let ret: ISynthesisParameters = {
		mode: rawParams.synthesisMode,
		csvDataParameters: {
			delimiter: sensitiveCsvContent.delimiter,
			useColumns,
			sensitiveZeros: sensitiveCsvContent.headers
				.filter(h => h.hasSensitiveZeros)
				.map(h => h.name),
			recordLimit: rawParams.recordLimit,
		},
		baseSynthesisParameters: {
			resolution: rawParams.resolution,
			cacheMaxSize: rawParams.cacheSize,
			emptyValue: '',
		},
		reportingLength: rawParams.reportingLength,
	}

	switch (rawParams.synthesisMode) {
		case SynthesisMode.Unseeded:
			break
		case SynthesisMode.RowSeeded:
			break
		case SynthesisMode.ValueSeeded:
			ret = {
				...ret,
				oversampling:
					rawParams.oversamplingType === OversamplingType.Controlled
						? {
								oversamplingRatio: rawParams.oversamplingRatio,
								oversamplingTries: rawParams.oversamplingTries,
						  }
						: undefined,
			} as IValueSeededSynthesisParameters
			break
		case SynthesisMode.AggregateSeeded:
			ret = {
				...ret,
				useSyntheticCounts:
					rawParams.aggregateSeededUseSyntheticCounts ===
					UseSyntheticCounts.Yes,
			} as IAggregateSeededSynthesisParameters
			break
		case SynthesisMode.DP:
			ret = {
				...ret,
				dpParameters: {
					epsilon: rawParams.noiseEpsilon,
					delta:
						rawParams.recordLimit > 0
							? 1.0 / (rawParams.deltaFactor * rawParams.recordLimit)
							: 0.0,
					percentilePercentage: rawParams.percentilePercentage,
					percentileEpsilonProportion: rawParams.percentileEpsilonProportion,
					sigmaProportions: generateSigmaProportions(
						rawParams.reportingLength,
						rawParams.accuracyMode,
					),
				},
				noiseThreshold: {
					type: 'Adaptive',
					valuesByLen: generateNoisyThresholdValuesByLen(
						rawParams.fabricationMode,
						rawParams.threshold,
						rawParams.reportingLength,
					),
				},
				useSyntheticCounts:
					rawParams.dpAggregateSeededUseSyntheticCounts ===
					UseSyntheticCounts.Yes,
			} as IDpSynthesisParameters
			break
	}
	return ret
}

export function useOnRunGenerateAndEvaluate(): (
	rawParams: IRawSynthesisParameters,
) => Promise<void> {
	const sensitiveContent = useSensitiveContentValue()
	const manager = useSdsManagerInstance()[0]?.instance

	const { resultTable: sensitiveTable, newColumnNames } = useMemo(
		() =>
			namedSpread(
				sensitiveContent.table,
				spreadableHeaders(sensitiveContent).map(h => ({
					name: h.name,
					delimiter: h.spreadWithDelimiter!,
				})),
			),
		[sensitiveContent],
	)

	return useCallback(
		async (rawParams: IRawSynthesisParameters) => {
			const columnsToUse = new Set([
				...usableHeaders(sensitiveContent).map(h => h.name),
				...newColumnNames,
			])
			const synthesisParams = convertRawToSynthesisParameters(
				rawParams,
				sensitiveTable.columnNames().filter(c => columnsToUse.has(c)),
				sensitiveContent,
			)

			await manager?.startGenerateAndEvaluate(
				generateContextKey(rawParams),
				sensitiveTable.toCSV({ delimiter: sensitiveContent.delimiter }),
				synthesisParams,
			)
		},
		[sensitiveContent, manager, newColumnNames, sensitiveTable],
	)
}