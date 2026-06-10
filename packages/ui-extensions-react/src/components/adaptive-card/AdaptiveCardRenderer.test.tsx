/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, type ReactNode } from 'react'

import { ActionSet, ClipboardAction, DoistCard, TextBlock } from '@doist/ui-extensions-core'

import { act, fireEvent, render, screen } from '@testing-library/react'
import { AdaptiveCard, GlobalRegistry } from 'adaptivecards'

import { ClipboardAction as ClipboardActionist } from '../../actions'
import { registerRenderers } from '../../renderers'
import { getDefaultCard } from '../../test/fixtures'
import { registerRenderedRoot } from '../../utils/rendered-roots'

import { AdaptiveCardRenderer } from './AdaptiveCardRenderer'

import type { Root } from 'react-dom/client'
import type { DoistCardResult } from '../../types'

class TestErrorBoundary extends Component<
    { fallback: ReactNode; children: ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        return this.state.hasError ? this.props.fallback : this.props.children
    }
}

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

    it('displays the error text and invokes onError if type is error', () => {
        const error = { error: new Error('kwijibo') }
        const result: DoistCardResult = {
            type: 'error',
            error,
        }
        const onError = jest.fn()

        render(
            <AdaptiveCardRenderer
                result={result}
                onAction={emptyOnAction}
                onError={onError}
                errorText={errorText}
                clipboardHandler={() => {}}
            />,
        )

        expect(screen.getByTestId(adaptiveCardErrorTestId)).toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveCardTestId)).not.toBeInTheDocument()
        expect(screen.queryByTestId(adaptiveLoadingTestId)).not.toBeInTheDocument()
        expect(onError).toHaveBeenCalledWith(error)
    })

    it('displays the adaptive card if type is loaded', async () => {
        // Serialize to JSON (as the framework receives it from the server) so
        // parse() rebuilds the body; passing the card instance leaves it empty.
        const card = JSON.parse(JSON.stringify(getDefaultCard())) as DoistCard
        const result: DoistCardResult = {
            type: 'loaded',
            card,
        }

        render(
            <AdaptiveCardRenderer
                result={result}
                onAction={emptyOnAction}
                errorText={errorText}
                clipboardHandler={() => {}}
            />,
        )

        // Wait for content produced only by the deferred adaptiveCard.render(),
        // not just the wrapper which renders for any non-error state.
        expect(await screen.findByPlaceholderText('Search here...')).toBeInTheDocument()
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

        it('renders the ClipboardAction and triggers the clipboard handler', async () => {
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

            fireEvent.click(await screen.findByRole('button'))

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

    describe('custom input/action renderers', () => {
        beforeAll(() => {
            registerRenderers()
        })
        afterAll(() => jest.restoreAllMocks())

        // In dev, React logs these render-phase violations to console.error. We defer the card
        // render into a microtask to avoid them, and these tests confirm that none of them appear:
        //   - "flushSync": our renderers called flushSync (around createRoot().render()) while
        //     React was still rendering or committing. This is the main one the deferral prevents.
        //   - "updates from render" / "not allowed": a setState() during render ("triggering
        //     nested component updates from render is not allowed"). Both phrases match this one
        //     warning.
        //   - "Cannot update a component": a setState() that targets a different component
        //     mid-render ("Cannot update a component (X) while rendering a different component (Y)").
        const RENDER_PHASE_WARNING =
            /flushSync|updates from render|not allowed|Cannot update a component/i

        it('renders custom inputs without a flushSync render-phase warning', async () => {
            // Serialize to JSON (as the framework receives it from the server) so parse()
            // rebuilds the elements through the registered custom renderers.
            const card = JSON.parse(JSON.stringify(getDefaultCard())) as DoistCard
            const errorSpy = jest.spyOn(global.console, 'error')

            const { unmount } = render(
                <AdaptiveCardRenderer
                    result={{ type: 'loaded', card }}
                    onAction={emptyOnAction}
                    errorText={errorText}
                    clipboardHandler={() => {}}
                />,
            )

            expect(await screen.findByTestId('TextInput.Search')).toBeInTheDocument()
            expect(await screen.findByRole('button', { name: 'Search GIFs' })).toBeInTheDocument()
            expect(screen.getByTestId(adaptiveCardTestId)).toBeInTheDocument()

            await act(async () => {
                unmount()
                await Promise.resolve()
            })

            // Assert after unmount so the deferred root teardown is covered too,
            // not just the initial render.
            const renderPhaseWarnings = errorSpy.mock.calls.filter(
                ([message]) => typeof message === 'string' && RENDER_PHASE_WARNING.test(message),
            )
            expect(renderPhaseWarnings).toEqual([])
            errorSpy.mockRestore()
        })

        it('tears down the previous card on swap without a flushSync render-phase warning', async () => {
            const firstCard = JSON.parse(JSON.stringify(getDefaultCard())) as DoistCard

            const { rerender } = render(
                <AdaptiveCardRenderer
                    result={{ type: 'loaded', card: firstCard }}
                    onAction={emptyOnAction}
                    errorText={errorText}
                    clipboardHandler={() => {}}
                />,
            )

            expect(await screen.findByTestId('TextInput.Search')).toBeInTheDocument()

            // A card swap runs the deferred root teardown mid-commit, not just on unmount.
            const secondCard = JSON.parse(
                JSON.stringify(getDefaultCard()).replace('TextInput.Search', 'TextInput.Search2'),
            ) as DoistCard
            // Spy as late as possible: the teardown under test runs during this swap.
            const errorSpy = jest.spyOn(global.console, 'error')
            await act(async () => {
                rerender(
                    <AdaptiveCardRenderer
                        result={{ type: 'loaded', card: secondCard }}
                        onAction={emptyOnAction}
                        errorText={errorText}
                        clipboardHandler={() => {}}
                    />,
                )
                await Promise.resolve()
            })

            expect(await screen.findByTestId('TextInput.Search2')).toBeInTheDocument()

            const renderPhaseWarnings = errorSpy.mock.calls.filter(
                ([message]) => typeof message === 'string' && RENDER_PHASE_WARNING.test(message),
            )
            expect(renderPhaseWarnings).toEqual([])
            errorSpy.mockRestore()
        })

        it('keeps the previous card visible while the next result is loading', async () => {
            const card = JSON.parse(JSON.stringify(getDefaultCard())) as DoistCard

            const { rerender } = render(
                <AdaptiveCardRenderer
                    result={{ type: 'loaded', card }}
                    onAction={emptyOnAction}
                    errorText={errorText}
                    clipboardHandler={() => {}}
                />,
            )

            expect(await screen.findByPlaceholderText('Search here...')).toBeInTheDocument()

            // An action round-trip flips the result to loading while the next card is fetched.
            await act(async () => {
                rerender(
                    <AdaptiveCardRenderer
                        result={{ type: 'loading' }}
                        onAction={emptyOnAction}
                        errorText={errorText}
                        clipboardHandler={() => {}}
                    />,
                )
                await Promise.resolve()
            })

            expect(screen.getByTestId(adaptiveLoadingTestId)).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Search here...')).toBeInTheDocument()

            const nextCard = JSON.parse(
                JSON.stringify(getDefaultCard()).replace('Search here...', 'Next card...'),
            ) as DoistCard
            rerender(
                <AdaptiveCardRenderer
                    result={{ type: 'loaded', card: nextCard }}
                    onAction={emptyOnAction}
                    errorText={errorText}
                    clipboardHandler={() => {}}
                />,
            )
            expect(await screen.findByPlaceholderText('Next card...')).toBeInTheDocument()
            expect(screen.queryByPlaceholderText('Search here...')).not.toBeInTheDocument()
        })

        it('fires onAction when the inline action button is clicked', async () => {
            const card = JSON.parse(JSON.stringify(getDefaultCard())) as DoistCard
            const onAction = jest.fn()

            render(
                <AdaptiveCardRenderer
                    result={{ type: 'loaded', card }}
                    onAction={onAction}
                    errorText={errorText}
                    clipboardHandler={() => {}}
                />,
            )

            fireEvent.click(await screen.findByRole('button', { name: 'Search GIFs' }))

            // The fixture's inline action is an Action.Submit with id 'Action.Search',
            // so the click must wire that exact action through handleAction's submit branch.
            expect(onAction).toHaveBeenCalledWith(
                expect.objectContaining({ actionType: 'submit', actionId: 'Action.Search' }),
                undefined,
            )
        })
    })

    describe('render failure', () => {
        afterEach(() => jest.restoreAllMocks())

        it('routes a render failure to onError and the error boundary, and unmounts partial roots', async () => {
            const unmountPartialRoot = jest.fn()
            const partialRoot = {
                render: jest.fn(),
                unmount: unmountPartialRoot,
            } as unknown as Root
            jest.spyOn(AdaptiveCard.prototype, 'render').mockImplementation(() => {
                // Simulate an input that mounted before the failure.
                registerRenderedRoot(partialRoot)
                throw new Error('render exploded')
            })

            const card = JSON.parse(JSON.stringify(getDefaultCard())) as DoistCard
            const onError = jest.fn()

            render(
                <TestErrorBoundary fallback={<div>card failed to render</div>}>
                    <AdaptiveCardRenderer
                        result={{ type: 'loaded', card }}
                        onAction={emptyOnAction}
                        onError={onError}
                        errorText={errorText}
                        clipboardHandler={() => {}}
                    />
                </TestErrorBoundary>,
            )

            // Spy as late as possible: the boundary-caught error is logged during this await.
            const errorSpy = jest.spyOn(global.console, 'error').mockImplementation()
            expect(await screen.findByText('card failed to render')).toBeInTheDocument()
            expect(
                errorSpy.mock.calls.some((args) =>
                    args.some((arg) => String(arg).includes('render exploded')),
                ),
            ).toBe(true)
            errorSpy.mockRestore()

            expect(onError).toHaveBeenCalledWith({ error: new Error('render exploded') })

            // The boundary unmounted the renderer; flush the deferred teardown microtask.
            await act(async () => {
                await Promise.resolve()
            })
            expect(unmountPartialRoot).toHaveBeenCalledTimes(1)
        })
    })
})
