/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { FC } from 'react'
import { memo } from 'react'
import styled from 'styled-components'

import { Flex } from '~components/Flexbox'

import { MultiValueColumns } from './MultiValueColumns'
import { SelectColumns } from './SelectColumns'
import { SensitiveZeros } from './SensitiveZeros'
import { SubjectId } from './SubjectId'

export const SelectCommands: FC = memo(function SelectCommand() {
	return (
		<Container justify="center" align="center">
			<SelectColumns />
			<Divider>|</Divider>
			<SubjectId />
			<Divider>|</Divider>
			<SensitiveZeros />
			<Divider>|</Divider>
			<MultiValueColumns />
		</Container>
	)
})
SelectCommands.displayName = 'SelectCommands'

const Container = styled(Flex)`
	border-bottom: 1px solid ${p => p.theme.palette.neutralLight};
	box-shadow: ${p => p.theme.effects.elevation4};
`

const Divider = styled.span`
	font-size: ${p => p.theme.fonts.smallPlus.fontSize};
	color: ${p => p.theme.palette.neutralTertiary};
`