import { ClipboardAction, SubmitAction } from './actions'
import { DoistCard, TextBlock } from './card-elements'
import { Column, ColumnSet, Container } from './containers'

import type { Props } from './props'

describe('card-elements', () => {
    describe('DoistCard', () => {
        describe('serialisation', () => {
            it('provides correct json with multiple items', () => {
                const card = new DoistCard()
                const text = new TextBlock('kwijibo')
                const container = new Container()

                container.addItem(text)
                card.addItem(container)

                expect(JSON.parse(JSON.stringify(card))).toMatchObject({
                    type: 'AdaptiveCard',
                    adaptiveCardistVersion: '0.3',
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.4',
                    body: [{ type: 'Container', items: [{ type: 'TextBlock', text: 'kwijibo' }] }],
                })
            })

            it('serialises correctly with actions on the main card', () => {
                const card = new DoistCard()
                const action = new SubmitAction()
                action.title = 'kwijibo'
                action.data = {
                    some: 'info',
                }

                card.addAction(action)

                expect(JSON.parse(JSON.stringify(card))).toMatchObject({
                    type: 'AdaptiveCard',
                    adaptiveCardistVersion: '0.3',
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.4',
                    body: [],
                    actions: [{ type: 'Action.Submit', title: 'kwijibo', data: { some: 'info' } }],
                })
            })

            it('serialises custom actions correctly', () => {
                const card = new DoistCard()
                const action = new ClipboardAction()
                action.title = 'Dr9S'
                action.text = 'Intelligentsia pour-over adaptogen artisan pok pok paleo pitchfork.'

                card.addAction(action)

                expect(JSON.parse(JSON.stringify(card))).toMatchObject({
                    type: 'AdaptiveCard',
                    adaptiveCardistVersion: '0.3',
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.4',
                    body: [],
                    actions: [{ type: 'Action.Clipboard', title: action.title, text: action.text }],
                })
            })

            it('serialises column data correctly', () => {
                const card = new DoistCard()
                const column = new Column('stretch')
                const text = new TextBlock('kwijibo')

                column.addItem(text)

                const columns = new ColumnSet()
                columns.horizontalAlignment = 'center'
                columns.addColumn(column)

                card.addItem(columns)

                expect(JSON.parse(JSON.stringify(card))).toMatchObject({
                    type: 'AdaptiveCard',
                    adaptiveCardistVersion: '0.3',
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    version: '1.4',
                    body: [
                        {
                            type: 'ColumnSet',
                            horizontalAlignment: 'center',
                            columns: [
                                {
                                    type: 'Column',
                                    items: [{ type: 'TextBlock', text: 'kwijibo' }],
                                    width: 'stretch',
                                },
                            ],
                        },
                    ],
                })
            })
        })
    })

    describe('TextBlock', () => {
        it('adds props from ctor', () => {
            const props: Props<TextBlock> = {
                text: 'kwijibo',
                weight: 'bolder',
                color: 'accent',
                fontType: 'default',
                height: 'auto',
                horizontalAlignment: 'center',
                isSubtle: true,
                maxLines: 2,
                separator: true,
                size: 'extraLarge',
                spacing: 'default',
                style: 'default',
                wrap: true,
            }
            const textBlock = TextBlock.from(props)

            expect(JSON.parse(JSON.stringify(textBlock))).toMatchObject({
                type: 'TextBlock',
                ...props,
            })
        })
    })
})
