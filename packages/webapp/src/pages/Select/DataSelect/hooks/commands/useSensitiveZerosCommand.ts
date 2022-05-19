/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { checkedItemsCommand } from '@essex/arquero-react'
import type { ICommandBarItemProps } from '@fluentui/react'
import { useCallback, useMemo } from 'react'
import type { SetterOrUpdater } from 'recoil'

import type { ICsvContent } from '~models'

import { useColumnsWithZeros } from './useColumnsWithZeros.js'
import { useOnSensitiveZeroCheckToggle } from './useOnSensitiveZeroCheckChange.js'

export function useSensitiveZerosCommand(
	content: ICsvContent,
	setter: SetterOrUpdater<ICsvContent>,
): ICommandBarItemProps {
	const columnsWithZeros = useColumnsWithZeros(content)
	const selectedZeros = useMemo(() => {
		return content.headers
			.filter(h => h.use)
			.filter(h => h.hasSensitiveZeros)
			.map(h => h.name)
	}, [content])

	const handleSensitiveCheckChange = useOnSensitiveZeroCheckToggle(setter)

	const handleZeroCheckChangeByName = useCallback(
		name => {
			const columns = content.table.columnNames()
			const index = columns.findIndex(n => n === name)
			handleSensitiveCheckChange && handleSensitiveCheckChange(index)
		},
		[content.table, handleSensitiveCheckChange],
	)
	return useMemo(
		() =>
			checkedItemsCommand(
				columnsWithZeros || [],
				selectedZeros,
				handleZeroCheckChangeByName,
				{
					key: 'sensitive-zeros',
					text: 'Sensitive zeros',
					disabled: columnsWithZeros?.length === 0,
				},
			),
		[columnsWithZeros, selectedZeros, handleZeroCheckChangeByName],
	)
}
