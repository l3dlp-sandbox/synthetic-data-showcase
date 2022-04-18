/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { HeaderNames } from 'sds-wasm'

import type { NoisyCountThresholdType } from '~models'

import type { OversamplingType } from './OversamplingType'
import type { SynthesisMode } from './SynthesisMode'
import type { UseSyntheticCounts } from './UseSyntheticCounts'

export interface IContextParameters {
	key: string
	delimiter: string
	useColumns: HeaderNames
	sensitiveZeros: HeaderNames
	recordLimit: number
	synthesisMode: SynthesisMode
	resolution: number
	cacheSize: number
	reportingLength: number
	oversamplingType: OversamplingType
	oversamplingRatio: number
	oversamplingTries: number
	useSyntheticCounts: UseSyntheticCounts
	percentilePercentage: number
	percentileEpsilonProportion: number
	noiseEpsilon: number
	noiseDelta: number
	thresholdType: NoisyCountThresholdType
	thresholdValue: number
	emptyValue: string
	isEvaluated: boolean
}

export type AllContextsParameters = IContextParameters[]
