import { TextInput } from '.'

import type { Props } from './props'

describe('inputs', () => {
    describe('text.input', () => {
        it('adds props from ctor', () => {
            const props: Props<TextInput> = {
                id: 'kwijibo',
                rows: 2,
                inputStyle: 'search',
                defaultValue: 'text',
                errorMessage: 'error',
                height: 'auto',
                horizontalAlignment: 'center',
                isMultiline: true,
                isRequired: true,
                label: 'label',
                maxLength: 25,
                placeholder: 'placeholder',
                separator: true,
                spacing: 'default',
            }
            const input = TextInput.from(props)

            const { defaultValue, ...rest } = props

            expect(JSON.parse(JSON.stringify(input))).toMatchObject({
                type: 'Input.Text',
                value: defaultValue,
                ...rest,
            })
        })
    })
})
