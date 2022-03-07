import { TextInput } from 'adaptivecards'

import { AdaptiveCardistCard } from '..'

import { SubmitActionist } from '.'

import type { AssociatedInputs } from '@doist/ui-extensions-core'

describe('SubmitActionist', () => {
    type AssociatedInputsTest = [AssociatedInputs, number]
    test.each<AssociatedInputsTest>([
        ['auto', 1],
        ['ignorevalidation', 2],
        ['none', 2],
    ])(
        'when associatedInputs is %p, expected inputs is %p',
        (associatedInput: AssociatedInputs, expectedNumberOfInputs: number) => {
            const card = new AdaptiveCardistCard()
            const requiredInput = new TextInput()
            requiredInput.id = 'text.input'
            requiredInput.isRequired = true

            const optionalInput = new TextInput()
            optionalInput.id = 'optional.text.input'

            card.addItem(requiredInput)
            card.addItem(optionalInput)

            const action = new SubmitActionist()
            action.id = 'kwijibo'
            action.associatedInput = associatedInput

            card.addAction(action)

            card.onExecuteAction = () => {
                const inputs = card.getAllInputs()
                expect(inputs.length).toEqual(expectedNumberOfInputs)
            }

            card.render()

            action.execute()
        },
    )
})
