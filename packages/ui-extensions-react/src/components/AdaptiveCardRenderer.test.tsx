/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react'

import { ActionSet, ClipboardAction, DoistCard, TextBlock } from '@doist/ui-extensions-core'

import { fireEvent, render, screen } from '@testing-library/react'
import { GlobalRegistry } from 'adaptivecards'

import { ClipboardAction as ClipboardActionist } from '../actions'
import { getDefaultCard } from '../test/fixtures'

import { AdaptiveCardRenderer } from './AdaptiveCardRenderer'

import type { DoistCardResult } from '../types'

describe('AdaptiveCardRenderer', () => {
    function emptyOnAction() {
        // Just leave this empty as it's basically a placeholder
    }

    const errorText = 'There was an error'
    const adaptiveLoadingTestId = 'adaptive-loading'
    const adaptiveCardTestId = 'adaptive-card'
    const adaptiveCardErrorTestId = 'adaptive-card-error'

    it('displays the Loading control when type is loading', () => {
        const result: DoistCardResult = {
            type: 'loading',
        }

        render(
            <AdaptiveCardRenderer
                result={result}
                onAction={emptyOnAction}
                errorText={errorText}
                clipboardHandler={() => {}}
            />,
        )

        expect(screen.getByTestId(adaptiveLoadingTestId)).toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveCardErrorTestId)).not.toBeInTheDocument()
    })

    it('displays the error text if type is error', () => {
        const result: DoistCardResult = {
            type: 'error',
            error: {
                error: new Error('kwijibo'),
            },
        }

        render(
            <AdaptiveCardRenderer
                result={result}
                onAction={emptyOnAction}
                errorText={errorText}
                clipboardHandler={() => {}}
            />,
        )

        expect(screen.getByTestId(adaptiveCardErrorTestId)).toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveCardTestId)).not.toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveLoadingTestId)).not.toBeInTheDocument()
    })

    it('displays the adaptive card if type is loaded', () => {
        const result: DoistCardResult = {
            type: 'loaded',
            card: getDefaultCard(),
        }

        render(
            <AdaptiveCardRenderer
                result={result}
                onAction={emptyOnAction}
                errorText={errorText}
                clipboardHandler={() => {}}
            />,
        )

        expect(screen.getByTestId('adaptive-card')).toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveLoadingTestId)).not.toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveCardErrorTestId)).not.toBeInTheDocument()
    })

    function registerCustomRenderers() {
        GlobalRegistry.actions.register(ClipboardActionist.JsonTypeName, ClipboardActionist)
    }

    describe('Clipboard tests', () => {
        beforeAll(() => {
            registerCustomRenderers()
            // Given that we don't have a full test harness on AdaptiveCardRenderer,
            // we expect the underlying adaptivecards library to throw a benign
            // warning: markdownProcessingNotEnabled
            jest.spyOn(global.console, 'warn').mockImplementation()
        })
        afterAll(() => jest.restoreAllMocks())

        it('renders the ClipboardAction and triggers the clipboard handler', () => {
            const clipboardText = JSON.stringify({
                uniqueId: '872971b8-f394-48a1-a1c1-ec297d372880',
                error: 'Something went wrong 😅',
            })

            // Simulate serialization and de-serialization
            const card = JSON.parse(JSON.stringify(getErrorCard(clipboardText))) as DoistCard
            const clipboardHandler = jest.fn()

            render(
                <AdaptiveCardRenderer
                    onAction={emptyOnAction}
                    errorText={errorText}
                    result={{ card, type: 'loaded' }}
                    clipboardHandler={clipboardHandler}
                />,
            )

            fireEvent.click(screen.getByRole('button'))

            expect(clipboardHandler).toHaveBeenCalledTimes(1)
            expect(clipboardHandler).toHaveBeenLastCalledWith(clipboardText)
        })

        function getErrorCard(clipboardText?: string): DoistCard {
            const card = new DoistCard()
            card.doistCardVersion = '0.3'

            const textBlock = new TextBlock('This is an error card')
            textBlock.id = 'ErrorCard'
            textBlock.horizontalAlignment = 'center'
            textBlock.wrap = true

            card.addItem(textBlock)

            // Actions
            const actions = new ActionSet()
            actions.id = 'Actions'

            const clipboardButton = new ClipboardAction()
            clipboardButton.style = 'positive'
            clipboardButton.title = 'Copy Text'
            clipboardButton.text = clipboardText ?? 'clipboard text'

            actions.addAction(clipboardButton)

            card.addItem(actions)

            return card
        }
    })
})
