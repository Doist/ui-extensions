import { JsonSerializer } from 'typescript-json-serializer'

import { ClipboardAction, SubmitAction } from './actions'
import { TextBlock, TodoistCard } from './card-elements'
import { Column, ColumnSet, Container } from './containers'

import type { Props } from './props'

describe('card-elements', () => {
    describe('TodoistCard', () => {
        describe('card version', () => {
            // `toMatchObject` elsewhere in this file is a subset match and so cannot catch a
            // key going missing. These assert the exact set of version keys on the wire.
            it('writes the version to every supported key', () => {
                const card = new TodoistCard()
                card.todoistCardVersion = '0.6'

                const json = JSON.parse(JSON.stringify(card)) as Record<string, unknown>

                expect({
                    todoistCardVersion: json.todoistCardVersion,
                    doistCardVersion: json.doistCardVersion,
                    adaptiveCardistVersion: json.adaptiveCardistVersion,
                }).toEqual({
                    todoistCardVersion: '0.6',
                    doistCardVersion: '0.6',
                    adaptiveCardistVersion: '0.6',
                })
            })

            it('defaults every version key to 0.3', () => {
                const json = JSON.parse(JSON.stringify(new TodoistCard())) as Record<
                    string,
                    unknown
                >

                expect({
                    todoistCardVersion: json.todoistCardVersion,
                    doistCardVersion: json.doistCardVersion,
                    adaptiveCardistVersion: json.adaptiveCardistVersion,
                }).toEqual({
                    todoistCardVersion: '0.3',
                    doistCardVersion: '0.3',
                    adaptiveCardistVersion: '0.3',
                })
            })

            it.each([
                ['the current key', { todoistCardVersion: '0.6' }, '0.6'],
                ['the previous key', { doistCardVersion: '0.5' }, '0.5'],
                ['the oldest key', { adaptiveCardistVersion: '0.4' }, '0.4'],
                [
                    'every key, preferring the newest',
                    {
                        todoistCardVersion: '0.6',
                        doistCardVersion: '0.5',
                        adaptiveCardistVersion: '0.4',
                    },
                    '0.6',
                ],
                ['no version key at all', {}, '0.3'],
            ])('reads a card carrying %s', (_label, payload, expected) => {
                const card = new JsonSerializer().deserializeObject(payload, TodoistCard)

                expect(card?.todoistCardVersion).toEqual(expected)
            })
        })

        describe('serialisation', () => {
            it('provides correct json with multiple items', () => {
                const card = new TodoistCard()
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
                const card = new TodoistCard()
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
                const card = new TodoistCard()
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
                const card = new TodoistCard()
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
