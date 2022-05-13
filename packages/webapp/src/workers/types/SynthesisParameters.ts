/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type {
	IBaseSynthesisParameters,
	ICsvDataParameters,
	IDpParameters,
	INoisyCountThreshold,
	IOversamplingParameters,
} from 'sds-wasm'

import type { SynthesisMode } from './SynthesisMode'

export interface ISynthesisParameters {
	key: string
	mode: SynthesisMode
	csvDataParameters: ICsvDataParameters
	baseSynthesisParameters: IBaseSynthesisParameters
	reportingLength: number
}

export interface IUnseededSynthesisParameters extends ISynthesisParameters {
	mode: SynthesisMode.Unseeded
}

export interface IRowSeededSynthesisParameters extends ISynthesisParameters {
	mode: SynthesisMode.RowSeeded
}

export interface IValueSeededSynthesisParameters extends ISynthesisParameters {
	mode: SynthesisMode.ValueSeeded
	oversampling?: IOversamplingParameters
}

export interface IAggregateSeededSynthesisParameters extends ISynthesisParameters {
	mode: SynthesisMode.AggregateSeeded
	useSyntheticCounts: boolean
}

export interface IDpSynthesisParameters extends ISynthesisParameters {
	mode: SynthesisMode.DP
	dpParameters: IDpParameters
	noiseThreshold: INoisyCountThreshold
	useSyntheticCounts: boolean
}