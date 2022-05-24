/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { AtomicBuffer } from '~workers/utils'

import type { ISynthesisParameters } from './SynthesisParameters.js'
import type { IWasmSynthesizerWorkerStatus } from './WasmSynthesizerWorkerStatus.js'

export interface ISynthesisInfo {
	key: string
	parameters: ISynthesisParameters
	status: IWasmSynthesizerWorkerStatus
	startedAt: Date
	finishedAt?: Date
	progress: AtomicBuffer
	errorMessage?: string
}
