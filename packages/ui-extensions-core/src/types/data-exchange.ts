import type { TodoistCard } from '../todoist-card'
import type { TodoistCardBridge } from './bridges'
import type { TodoistContext, TodoistContextMenuData, TodoistContextUser } from './todoist'
import type { TwistContext, TwistContextMenuData, TwistContextUser } from './twist'

/**
 * The types of actions that an adaptive card integration can request.
 */
export type TodoistCardActionType = 'initial' | 'submit'

/**
 * Input field IDs along with their values that are sent as a part of the adaptive card action.
 */
export type TodoistCardActionInputs = Record<string, string>

/**
 * Action Parameters. These are used, for example, with context menu extensions and
 * will provide `ContextMenuData` in that instance.
 */
export type TodoistCardActionParams = Record<string, unknown>

/**
 * The data fields of an adaptive card action that are sent as a part of an adaptive card action.
 */
export type TodoistCardActionData = Record<string, unknown>

/**
 * The different extension types that are currently available.
 */
export type TodoistCardExtensionType = 'composer' | 'context-menu' | 'settings'

/**
 * When a context menu extension is triggered, the data will be sent in the
 * `params` field of the `TodoistCardAction`. This type will allow you to
 * cast that data to something specific.
 */
export type ContextMenuData = TodoistContextMenuData | TwistContextMenuData

/**
 * Represents an action that the user has done on the client.
 */
export type TodoistCardAction = {
    actionType: TodoistCardActionType
    /**
     * The action ID will identify to the integration what it should be performing.
     * This is provided by the integration itself.
     */
    actionId?: string
    /**
     * The input data, for example, what the user has typed into a Text.Input
     */
    inputs?: TodoistCardActionInputs
    /**
     * The data that has been associated with incoming request, eg, the data attached to
     * a button
     */
    data?: TodoistCardActionData
    /**
     * For context menu extensions, these params will be `ContextMenuData`
     */
    params?: TodoistCardActionParams
}

/**
 * The current user that invoked the integration.
 */
export type TodoistCardContextUser = TodoistContextUser | TwistContextUser

export type Theme = 'light' | 'dark'

export type Platform = 'desktop' | 'mobile'

export type TodoistCardContext = {
    user: TodoistCardContextUser
    theme: Theme
    twist?: TwistContext
    todoist?: TodoistContext
    platform?: Platform
}

/**
 * A top-level object representing a request the integration client does against the integration server.
 */
export type TodoistCardRequest<Action extends Partial<TodoistCardAction> = TodoistCardAction> = {
    context: TodoistCardContext
    action: Action
    extensionType: TodoistCardExtensionType
    /**
     * This is the maximum version of Todoist Card that the requesting client supports. This can be used
     * to send back different cards based on the supported version.
     */
    maximumTodoistCardVersion: number | undefined
    /**
     * The older name for `maximumTodoistCardVersion`, sent with the same value so that
     * extension servers reading it keep working.
     */
    maximumDoistCardVersion: number | undefined
}

/**
 * A top-level object representing a response by the server agains the integration client.
 */
export type TodoistCardResponse = {
    card?: TodoistCard
    bridges?: TodoistCardBridge[]
}

export type TodoistCardError = {
    error: Error
    request?: TodoistCardRequest
    bridges?: TodoistCardBridge[]
}
