import { useCallback, useState } from 'react'

import { processRequest } from '../api/adaptive-cards-server'

import type {
    DoistCardAction,
    DoistCardActionParams,
    DoistCardBridge,
    DoistCardError,
    DoistCardExtensionType,
    DoistCardRequest,
    DoistCardResponse,
} from '@doist/ui-extensions-core'
import type {
    BridgeActionCallbacks,
    DoistCardResult,
    DoistCardsConnection,
    ExtensionCard,
    ExtensionContext,
    ExtensionError,
    ExtensionRequest,
    ExtensionVersion,
} from '../types'

const MAXIMUM_CARDIST_VERSION = 0.6

export type DoistCardConnectionParams = {
    context: ExtensionContext
    bridgeActionCallbacks: BridgeActionCallbacks
    endpointUrl: string
    extensionType?: DoistCardExtensionType
    onError?: (error: DoistCardError) => void
    token: string
    params?: DoistCardActionParams
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
}: DoistCardConnectionParams): DoistCardsConnection {
    const [result, setResult] = useState<DoistCardResult>({ type: 'loading' })

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
        async (action: DoistCardAction, loadingText?: string) => {
            setLoading(loadingText)
            const request = createRequest(
                version,
                context,
                action,
                extensionType ?? 'composer',
                params,
            )
            try {
                const response = await processRequest<ExtensionRequest, DoistCardResponse>(
                    request,
                    endpointUrl,
                    token,
                )

                const { card, bridges } = response

                if (bridges) {
                    bridges.forEach((bridge: DoistCardBridge) => {
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
    action: DoistCardAction,
    extensionType?: DoistCardExtensionType,
    actionParams?: DoistCardActionParams,
): ExtensionRequest {
    switch (version) {
        case 2: {
            const requestV2: DoistCardRequest = {
                context,
                action: {
                    ...action,
                    params: actionParams,
                },
                extensionType: extensionType ?? 'composer',
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
        case 2: {
            const errorV2: DoistCardError = {
                error,
                request,
            }
            return errorV2
        }
    }
}
