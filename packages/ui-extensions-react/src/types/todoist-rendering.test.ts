import { AdaptiveCardistCard } from './todoist-rendering'

describe('AdaptiveCardistCard', () => {
    describe('card version', () => {
        it.each([
            ['the current key', { todoistCardVersion: '0.4' }, '0.4'],
            ['the previous key', { doistCardVersion: '0.3' }, '0.3'],
            ['the oldest key', { adaptiveCardistVersion: '0.2' }, '0.2'],
            [
                'every key, preferring the newest',
                {
                    todoistCardVersion: '0.4',
                    doistCardVersion: '0.3',
                    adaptiveCardistVersion: '0.2',
                },
                '0.4',
            ],
        ])('reads a card carrying %s', (_label, payload, expected) => {
            const card = new AdaptiveCardistCard()
            card.parse({ type: 'AdaptiveCard', version: '1.4', ...payload })

            expect([
                card.todoistCardVersion,
                card.doistCardVersion,
                card.adaptiveCardistVersion,
            ]).toEqual([expected, expected, expected])
        })

        it('keeps the keys in step when the version is set directly', () => {
            const card = new AdaptiveCardistCard()
            card.todoistCardVersion = '0.4'

            expect(card.toJSON()).toMatchObject({
                todoistCardVersion: '0.4',
                doistCardVersion: '0.4',
                adaptiveCardistVersion: '0.4',
            })
        })

        it('writes the version to every supported key', () => {
            const card = new AdaptiveCardistCard()
            card.parse({ type: 'AdaptiveCard', version: '1.4', todoistCardVersion: '0.4' })

            expect(card.toJSON()).toMatchObject({
                todoistCardVersion: '0.4',
                doistCardVersion: '0.4',
                adaptiveCardistVersion: '0.4',
            })
        })
    })
})
