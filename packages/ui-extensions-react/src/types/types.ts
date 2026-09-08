import type {
    TodoistCard,
    TodoistCardAction,
    TodoistCardBridge as OriginalTodoistCardBridge,
    TodoistCardContext,
    TodoistCardError,
    TodoistCardRequest,
    TodoistCardResponse,
} from '@doist/ui-extensions-core'
import type { AdaptiveCardistCard } from './todoist-rendering'

// For details on the Data Exchange Format (DEF) versions, please see
// https://developer.twist.com/ui-extensions#handling-user-requests
export type ExtensionVersion = 2

export type ExtensionContext = TodoistCardContext
export type ExtensionRequest = TodoistCardRequest
export type ExtensionResponse = TodoistCardResponse | { card?: AdaptiveCardistCard }
export type ExtensionError = TodoistCardError
export type ExtensionCard = TodoistCard | AdaptiveCardistCard

export type TodoistCardsConnection = {
    onAction: (request: TodoistCardAction) => void
    result: TodoistCardResult
}

export type TodoistCardResult =
    | { type: 'loading'; loadingText?: string }
    | { type: 'loaded'; card: ExtensionCard }
    | { type: 'error'; error: ExtensionError }

export type ConsentRequiredBridge = {
    bridgeActionType: 'consent.required'
    scopes: string
}

type AllBridgeActionTypes = TodoistCardBridge['bridgeActionType']
export type TodoistCardBridge = OriginalTodoistCardBridge | ConsentRequiredBridge

export type BridgeActionCallbacks = Partial<
    Record<AllBridgeActionTypes, (action: TodoistCardBridge) => unknown>
>
