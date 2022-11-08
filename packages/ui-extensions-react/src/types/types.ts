import type {
    DoistCard,
    DoistCardAction,
    DoistCardBridge as OriginalDoistCardBridge,
    DoistCardContext,
    DoistCardError,
    DoistCardRequest,
    DoistCardResponse,
} from '@doist/ui-extensions-core'
import type { AdaptiveCardistCard } from './doist-rendering'

// For details on the Data Exchange Format (DEF) versions, please see
// https://developer.twist.com/ui-extensions#handling-user-requests
export type ExtensionVersion = 2

export type ExtensionContext = DoistCardContext
export type ExtensionRequest = DoistCardRequest
export type ExtensionResponse = DoistCardResponse | { card?: AdaptiveCardistCard }
export type ExtensionError = DoistCardError
export type ExtensionCard = DoistCard | AdaptiveCardistCard

export type DoistCardsConnection = {
    onAction: (request: DoistCardAction) => void
    result: DoistCardResult
}

export type DoistCardResult =
    | { type: 'loading'; loadingText?: string }
    | { type: 'loaded'; card: ExtensionCard }
    | { type: 'error'; error: ExtensionError }

export type ConsentRequiredBridge = {
    bridgeActionType: 'consent.required'
    scopes: string
}

type AllBridgeActionTypes = DoistCardBridge['bridgeActionType']
export type DoistCardBridge = OriginalDoistCardBridge | ConsentRequiredBridge

export type BridgeActionCallbacks = Partial<
    Record<AllBridgeActionTypes, (action: DoistCardBridge) => unknown>
>
