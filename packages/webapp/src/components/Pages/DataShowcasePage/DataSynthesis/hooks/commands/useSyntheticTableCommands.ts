/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { ICommandBarItemProps } from '@fluentui/react'
import { useMemo } from 'react'

import { useDownloadCommand } from '~components/Pages/DataShowcasePage/hooks'
import type { ICsvContent } from '~models'

export function useSyntheticTableCommands(
	content: ICsvContent,
): ICommandBarItemProps[] {
	const dlcmd = useDownloadCommand(content, 'synthetic_data.csv')
	return useMemo(() => [dlcmd], [dlcmd])
}