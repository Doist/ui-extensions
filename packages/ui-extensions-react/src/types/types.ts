import type {
    DoistCard,
    DoistCardAction,
    DoistCardBridge,
    DoistCardBridgeActionType,
    DoistCardContext,
    DoistCardError,
    DoistCardRequest,
    DoistCardResponse,
} from '@doist/ui-extensions-core'
import type { AdaptiveCardistCard } from './doist-rendering'

// For details on the Data Exchange Format (DEF) versions, please see
// https://handbook.doist.com/Engineering/Integrations/Specs/UI-Extensions-Technical.md
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
    | { type: 'loading' }
    | { type: 'loaded'; card: ExtensionCard }
    | { type: 'error'; error: ExtensionError }

export type BridgeActionCallbacks = Partial<
    Record<DoistCardBridgeActionType, (action: DoistCardBridge) => unknown>
>
