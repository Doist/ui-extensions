import { ClipboardAction } from '.'

describe('actions', () => {
    describe('ClipboardAction', () => {
        it('sets props correctly from the ctor', () => {
            const action = ClipboardAction.from({
                id: 'kwijibo',
                text: 'text copied',
                title: 'Click here',
            })

            expect(JSON.parse(JSON.stringify(action))).toMatchObject({
                type: 'Action.Clipboard',
                id: 'kwijibo',
                text: 'text copied',
                title: 'Click here',
            })
        })
    })
})
