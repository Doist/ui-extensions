import './AdaptiveCardRenderer.css'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Loading, Text } from '@doist/reactist'

import {
    Action,
    AdaptiveCard,
    CardElement,
    HostConfig,
    Input,
    SerializationContext,
} from 'adaptivecards'

import { ClipboardAction, OpenUrlAction, SubmitActionist } from '../../actions'
import { useRefCallback } from '../../hooks'
import { canSetAutoFocus } from '../../utils'
import { trackRootsDuringCardRender } from '../../utils/rendered-roots'

import { AdaptiveCardCanvas } from './AdaptiveCardCanvas'

import type { DoistCardAction, DoistCardActionData } from '@doist/ui-extensions-core'
import type { Root } from 'react-dom/client'
import type { DoistCardResult, ExtensionCard, ExtensionError } from '../../types'

type AdaptiveCardRendererProps = {
    onAction: (action: DoistCardAction, loadingText?: string) => void
    onError?: (error: ExtensionError) => void
    hostConfig?: HostConfig
    errorText: string
    result: DoistCardResult
    customElementParse?: (
        element: CardElement,
        source: unknown,
        context: SerializationContext,
    ) => void
    clipboardHandler: (text: string) => void
}

function getInputObject(inputs: Input[]): Record<string, string> {
    const result: Record<string, string> = {}

    for (const input of inputs) {
        if (!input.id) {
            continue
        }

        result[input.id] = input.value as string
    }

    return result
}

/**
 * Register a custom markdown parser
 * @see https://www.npmjs.com/package/adaptivecards#supporting-markdown
 */
export function registerMarkdownParser(markdownParser: (text: string) => string) {
    AdaptiveCard.onProcessMarkdown = (text, result) => {
        result.outputHtml = markdownParser(text)
        result.didProcess = true
    }
}

/**
 * Protects against XSS attacks by validating the URL.
 * @param url
 * @returns
 */
function isValidUrl(url: string): boolean {
    try {
        // Parse the URL using the URL constructor
        const parsedUrl = new URL(url)

        // Check for allowed protocols
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            return true
        } else {
            return false
        }
    } catch {
        // If URL constructor throws an error, it's an invalid URL
        return false
    }
}

/**
 * To support markdown, register a markdown parser via `registerMarkdownParser`
 * @see registerMarkdownParser
 */
export function AdaptiveCardRenderer({
    onAction,
    onError,
    hostConfig,
    errorText,
    result,
    customElementParse,
    clipboardHandler,
}: AdaptiveCardRendererProps): JSX.Element {
    useEffect(() => {
        if (result.type === 'error') {
            onError?.(result.error)
        }
    }, [result, onError])

    const elementParser = useRefCallback(
        (adaptiveCard: ExtensionCard) =>
            (element: CardElement, source: unknown, context: SerializationContext) => {
                if ('autoFocusId' in adaptiveCard) {
                    if (canSetAutoFocus(element)) {
                        element.shouldAutoFocus = element.id === adaptiveCard.autoFocusId
                    }
                }

                customElementParse?.(element, source, context)
            },
    )

    const handleAction = useRefCallback((adaptiveCard: AdaptiveCard) => (action: Action) => {
        try {
            const inputs = adaptiveCard.getAllInputs()
            const inputsObject = getInputObject(inputs)
            if (action instanceof OpenUrlAction && action.url && isValidUrl(action.url)) {
                window.open(action.url, '_blank')
            } else if (action instanceof ClipboardAction && action.text) {
                clipboardHandler(action.text)
            } else if (action instanceof SubmitActionist) {
                onAction(
                    {
                        actionType: 'submit',
                        actionId: action.id,
                        inputs: inputsObject,
                        data: action.toJSON()?.data as DoistCardActionData,
                    },
                    action.loadingText,
                )
            }
        } catch (e) {
            if (e instanceof Error) {
                onError?.({ error: e })
            }
        }
    })

    const loading = result.type === 'loading'
    const loadingText = loading ? result.loadingText : undefined
    const error = result.type === 'error' ? result.error : undefined

    const adaptiveCard = useMemo(() => {
        const result = new AdaptiveCard()
        if (hostConfig) {
            result.hostConfig = hostConfig
        }
        result.onExecuteAction = handleAction(result)
        return result
    }, [handleAction, hostConfig])

    const [card, setCard] = useState<HTMLElement | undefined>(undefined)
    const [renderError, setRenderError] = useState<Error | null>(null)
    const activeRootsRef = useRef<Root[]>([])

    // Read through a stable callback so an inline `onError` prop doesn't re-trigger
    // renderCard (which would remount the inputs and wipe their values).
    const reportRenderError = useRefCallback((renderFailure: Error) => {
        // onError notifies; setRenderError re-throws during render (below).
        onError?.({ error: renderFailure })
        setRenderError(renderFailure)
    })

    useLayoutEffect(
        function renderCard() {
            if (result.type !== 'loaded') {
                if (result.type === 'error') {
                    retireRoots(activeRootsRef.current)
                    activeRootsRef.current = []
                    queueMicrotask(() => setCard(undefined))
                }
                // While loading, keep the previous card (and its roots) mounted so it
                // stays visible under the loading overlay.
                return
            }

            let cancelled = false

            // adaptiveCard.render() mounts React roots via flushSync, which React forbids
            // during its render/commit phases, so defer past both with a microtask.
            queueMicrotask(() => {
                if (cancelled) return

                const roots: Root[] = []
                let rendered
                try {
                    // Track this render's roots so they can be unmounted later, even if
                    // render() throws partway.
                    rendered = trackRootsDuringCardRender(roots, () => {
                        const context = new SerializationContext()
                        context.onParseElement = elementParser(result.card)
                        adaptiveCard.parse(result.card, context)
                        return adaptiveCard.render()
                    })
                } catch (caught) {
                    reportRenderError(caught instanceof Error ? caught : new Error(String(caught)))
                }
                // Swap in this render's roots and retire the previous card's only now,
                // so the old card stays intact until the new one replaces it.
                retireRoots(activeRootsRef.current)
                activeRootsRef.current = roots
                setCard(rendered ?? undefined)
            })

            return function cancelPendingRender() {
                cancelled = true
            }
        },
        [result, adaptiveCard, elementParser, reportRenderError],
    )

    useLayoutEffect(function unmountCardRootsOnUnmount() {
        return () => {
            retireRoots(activeRootsRef.current)
            activeRootsRef.current = []
        }
    }, [])

    // Re-throw the deferred failure so the consumer's error boundary catches it.
    if (renderError) {
        throw renderError
    }

    if (error) {
        return (
            <div className="adaptive-card-content" data-testid="adaptive-card-error">
                <p className="ac-error">{errorText}</p>
            </div>
        )
    }

    return (
        <div className="adaptive-renderer-container" data-testid="adaptive-card">
            <LoadingOverlay isLoading={loading} loadingText={loadingText} />
            <AdaptiveCardCanvas card={card} />
        </div>
    )
}

// Deferred to avoid unmounting a root mid-commit.
function retireRoots(roots: Root[]) {
    if (roots.length === 0) return
    queueMicrotask(() => roots.forEach((root) => root.unmount()))
}

function LoadingOverlay({ isLoading, loadingText }: { isLoading: boolean; loadingText?: string }) {
    return isLoading ? (
        <div data-testid="adaptive-loading" className="adaptive-card-loading-container">
            <Loading aria-label="Card loading" />
            {loadingText ? <Text>{loadingText}</Text> : null}
        </div>
    ) : null
}
