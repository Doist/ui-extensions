import { createTextButton } from './button-helpers'

import type { Container, OpenUrlAction, SubmitAction, TextBlock } from '../doist-card'

describe('button-helpers', () => {
    describe('createTextButton', () => {
        it('creates correct elements when url provided', () => {
            const result = createTextButton({
                text: 'Go back',
                color: 'warning',
                url: 'https://kwijibo.com',
            })

            // We get the textblock like this rather than by id, because fixing the id
            // would be bad as a card could use this method a number of times, and end up with
            // a number of items all with the same id.
            const text = (result as Container).getItemAt(0) as TextBlock

            // Text checks
            expect(text.text).toEqual('Go back')
            expect(text.color).toEqual('warning')

            // Action checks
            expect(((result as Container).selectAction as OpenUrlAction).url).toEqual(
                'https://kwijibo.com',
            )
        })

        it('creates correct elements when url not provided', () => {
            const result = createTextButton({
                text: 'Go back',
                color: 'warning',
                id: 'Actions.GoHome',
            })

            // We get the textblock like this rather than by id, because fixing the id
            // would be bad as a card could use this method a number of times, and end up with
            // a number of items all with the same id.
            const text = (result as Container).getItemAt(0) as TextBlock

            // Text checks
            expect(text.text).toEqual('Go back')
            expect(text.color).toEqual('warning')

            // Action checks
            expect(((result as Container).selectAction as SubmitAction).id).toEqual(
                'Actions.GoHome',
            )
        })
    })
})
