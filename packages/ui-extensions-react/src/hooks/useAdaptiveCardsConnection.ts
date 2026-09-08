import { useCallback, useState } from 'react'

import { processRequest } from '../api/adaptive-cards-server'

import type {
    TodoistCardAction,
    TodoistCardActionParams,
    TodoistCardBridge,
    TodoistCardError,
    TodoistCardExtensionType,
    TodoistCardRequest,
    TodoistCardResponse,
} from '@doist/ui-extensions-core'
import type {
    BridgeActionCallbacks,
    ExtensionCard,
    ExtensionContext,
    ExtensionError,
    ExtensionRequest,
    ExtensionVersion,
    TodoistCardResult,
    TodoistCardsConnection,
} from '../types'

const MAXIMUM_CARDIST_VERSION = 0.6

export type TodoistCardConnectionParams = {
    context: ExtensionContext
    bridgeActionCallbacks: BridgeActionCallbacks
    endpointUrl: string
    extensionType?: TodoistCardExtensionType
    onError?: (error: TodoistCardError) => void
    token: string
    params?: TodoistCardActionParams
    version: ExtensionVersion
}

export function useAdaptiveCardsConnection({
    context,
    bridgeActionCallbacks,
    endpointUrl,
    token,
    extensionType,
    params,
    version,
}: TodoistCardConnectionParams): TodoistCardsConnection {
    const [result, setResult] = useState<TodoistCardResult>({ type: 'loading' })

    function setLoading(loadingText?: string) {
        setResult({ type: 'loading', loadingText })
    }

    function setCardData(card: ExtensionCard) {
        setResult({ type: 'loaded', card })
    }

    function setError(error: ExtensionError) {
        setResult({ type: 'error', error })
    }

    const onAction = useCallback(
        async (action: TodoistCardAction, loadingText?: string) => {
            setLoading(loadingText)
            const request = createRequest(
                version,
                context,
                action,
                extensionType ?? 'composer',
                params,
            )
            try {
                const response = await processRequest<ExtensionRequest, TodoistCardResponse>(
                    request,
                    endpointUrl,
                    token,
                )

                const { card, bridges } = response

                if (bridges) {
                    bridges.forEach((bridge: TodoistCardBridge) => {
                        const callback = bridgeActionCallbacks[bridge.bridgeActionType]
                        callback?.(bridge)
                    })
                }

                if (card) {
                    setCardData(card)
                }

                if (!card && !bridges) {
                    setError(
                        createError(version, new Error('No card or bridge data returned'), request),
                    )
                }
            } catch (error) {
                if (error instanceof Error) {
                    const adaptiveError = createError(version, error, request)
                    setError(adaptiveError)
                }
            }
        },
        [context, bridgeActionCallbacks, endpointUrl, extensionType, params, version, token],
    )

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return { result, onAction }
}

function createRequest(
    version: ExtensionVersion,
    context: ExtensionContext,
    action: TodoistCardAction,
    extensionType?: TodoistCardExtensionType,
    actionParams?: TodoistCardActionParams,
): ExtensionRequest {
    switch (version) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- version check for future extensibility
        case 2: {
            const requestV2: TodoistCardRequest = {
                context,
                action: {
                    ...action,
                    params: actionParams,
                },
                extensionType: extensionType ?? 'composer',
                maximumTodoistCardVersion: MAXIMUM_CARDIST_VERSION,
                maximumDoistCardVersion: MAXIMUM_CARDIST_VERSION,
            }
            return requestV2
        }
    }
}

function createError(
    version: ExtensionVersion,
    error: Error,
    request: ExtensionRequest,
): ExtensionError {
    switch (version) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- version check for future extensibility
        case 2: {
            const errorV2: TodoistCardError = {
                error,
                request,
            }
            return errorV2
        }
    }
}
