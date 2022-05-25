/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react'

import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

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
})
