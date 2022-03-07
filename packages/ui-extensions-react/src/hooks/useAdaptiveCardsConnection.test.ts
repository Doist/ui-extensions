import { act, renderHook } from '@testing-library/react-hooks'
import { TextBlock } from 'adaptivecards'

import * as adaptiveCardsServer from '../api/adaptive-cards-server'
import {
    DEFAULT_CONTEXT_V2,
    DEFAULT_SERVER_ABSOLUTE_PATH,
    DEFAULT_TOKEN,
    getDefaultCard,
} from '../test/fixtures'

import { useAdaptiveCardsConnection } from './useAdaptiveCardsConnection'

import type { DoistCardResponse } from '@doist/ui-extensions-core'
import type { ExtensionResponse } from '..'
import type { BridgeActionCallbacks, ExtensionContext, ExtensionVersion } from '../types'
import type { AdaptiveCardistCard } from '../types/doist-rendering'

function getProcessRequestMock() {
    return jest.spyOn(adaptiveCardsServer, 'processRequest')
}

async function renderHookAsync(
    version: ExtensionVersion,
    context: ExtensionContext,
    callbacks?: BridgeActionCallbacks,
) {
    const effectiveCallbacks = callbacks || {}
    const { result, waitForNextUpdate } = renderHook(() =>
        useAdaptiveCardsConnection({
            version,
            context: context,
            endpointUrl: DEFAULT_SERVER_ABSOLUTE_PATH,
            bridgeActionCallbacks: effectiveCallbacks,
            token: DEFAULT_TOKEN,
        }),
    )

    await act(async () => {
        result.current.onAction({
            actionType: 'initial',
        })

        return Promise.resolve()
    })

    return { result, waitForNextUpdate }
}

describe('useAdaptiveCardsConnection tests', () => {
    describe('v2 of data exchange format', () => {
        afterEach(() => jest.resetAllMocks())
        it('passes correct URL', async () => {
            const mock = getProcessRequestMock()
            mock.mockImplementationOnce(() =>
                Promise.resolve({
                    card: getDefaultCard(),
                } as ExtensionResponse),
            )

            await renderHookAsync(2, DEFAULT_CONTEXT_V2)

            expect(mock).toHaveBeenCalledWith(
                expect.anything(),
                DEFAULT_SERVER_ABSOLUTE_PATH,
                expect.anything(),
            )
        })

        it('passes correct context', async () => {
            const mock = getProcessRequestMock()
            mock.mockImplementationOnce(() =>
                Promise.resolve({
                    card: getDefaultCard(),
                } as ExtensionResponse),
            )

            await renderHookAsync(2, DEFAULT_CONTEXT_V2)

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({ context: DEFAULT_CONTEXT_V2 }),
                expect.anything(),
                expect.anything(),
            )
        })

        it('initial card set', async () => {
            const defaultCard = getDefaultCard()
            getProcessRequestMock().mockImplementationOnce(() =>
                Promise.resolve({
                    card: defaultCard,
                } as ExtensionResponse),
            )

            const { result } = await renderHookAsync(2, DEFAULT_CONTEXT_V2)

            expect(result.current.result).toEqual({ type: 'loaded', card: defaultCard })
        })

        it('refreshes after action invoked', async () => {
            const defaultCard = getDefaultCard()
            const secondaryCard = getDefaultCard()
            const secondRequest = 'SECOND_REQUEST'
            const id = 'kwijibo'
            const textBlock = new TextBlock(secondRequest)
            textBlock.id = id
            secondaryCard.addItem(textBlock)
            getProcessRequestMock()
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        card: defaultCard,
                    } as ExtensionResponse),
                )
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        card: secondaryCard,
                    } as ExtensionResponse),
                )

            const { result } = await renderHookAsync(2, DEFAULT_CONTEXT_V2)

            await act(async () => {
                result.current.onAction({
                    actionType: 'submit',
                })

                return Promise.resolve()
            })

            let card: AdaptiveCardistCard | undefined
            if (result.current.result.type === 'loaded') {
                card = result.current.result.card as AdaptiveCardistCard
            }

            const resultingTextBlock = card?.getElementById(id) as TextBlock | undefined
            expect(resultingTextBlock).not.toBeUndefined()
        })

        it('invokes composer append when bridge requires it', async () => {
            const expected = 'hello'
            getProcessRequestMock().mockImplementationOnce(() => {
                return Promise.resolve({
                    card: {},
                    bridge: {
                        bridgeActionType: 'composer.append',
                        text: expected,
                    },
                } as DoistCardResponse)
            })

            let actual: string | undefined = undefined
            await renderHookAsync(2, DEFAULT_CONTEXT_V2, {
                'composer.append': (x) => (actual = x.text),
            })

            expect(actual).toBe(expected)
        })
    })
})
