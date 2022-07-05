import type { DoistCard } from '../doist-card'

/**
 * The types of actions that an adaptive card integration can request.
 */
export type DoistCardActionType = 'initial' | 'submit' | 'error' | 'terminate'

/**
 * Input field IDs along with their values that are sent as a part of the adaptive card action.
 */
export type DoistCardActionInputs = Record<string, string>

/**
 * Action Parameters. These are used, for example, with context menu extensions and
 * will provide `ContextMenuData` in that instance.
 */
export type DoistCardActionParams = Record<string, unknown>

/**
 * The data fields of an adaptive card action that are sent as a part of an adaptive card action.
 */
export type DoistCardActionData = Record<string, unknown>

export type DoistCardExtensionType = 'composer' | 'context-menu' | `settings`

export type TwistContextMenuSource = 'message' | 'thread' | 'comment'

export type TodoistContextMenuSource = 'project' | 'task'

/**
 * When a context menu extension is triggered, the data will be sent in the
 * `params` field of the `DoistCardAction`. This type will allow you to
 * cast that data to something specific.
 */
export type ContextMenuData = {
    /**
     * The deep link back to the source
     */
    url: string
    /**
     * The id of the source object
     */
    sourceId: number
    /**
     * The content that has been sent with the request. This could be
     * a conversation message, thread comment, or thread title
     */
    content: string
    /**
     * The content that has been sent with the request. This could be
     * a conversation message, thread comment, or thread title, only this
     * has been scrubbed of all markdown formatting.
     */
    contentPlain: string
} & (
    | {
          /**
           * The source that made the request to the extension
           */
          source: TwistContextMenuSource
          /**
           * The date the content was posted. For threads, this will be the
           * date the thread was created.
           */
          postedDate: Date
      }
    | {
          /**
           * The source that made the request to the extension
           */
          source: TodoistContextMenuSource

          /**
           * The date the content was posted. For projects, this will be null.
           * For tasks this will be the date the task was created.
           */
          postedDate?: Date
      }
)

/**
 * Represents an action that the user has done on the client.
 */
export type DoistCardAction = {
    actionType: DoistCardActionType
    /**
     * The action ID will identify to the integration what it should be performing.
     * This is provided by the integration itself.
     */
    actionId?: string
    /**
     * The input data, for example, what the user has typed into a Text.Input
     */
    inputs?: DoistCardActionInputs
    /**
     * The data that has been associated with incoming request, eg, the data attached to
     * a button
     */
    data?: DoistCardActionData
    /**
     * For context menu extensions, these params will be `ContextMenuData`
     */
    params?: DoistCardActionParams
}

/**
 * The current user that invoked the integration.
 */
export type DoistCardContextUser = {
    short_name: string
    timezone: string
    id: number
    lang: string
    first_name: string
    name: string
    email: string
}

/**
 * The workspace where the user is currently browsing content.
 */
export type DoistCardContextWorkspace = {
    id: number
    name: string
}

/**
 * The current channel in which the user is browsing content. Is not present in the data if the user is not currently browsing a channel.
 */
export type DoistCardContextChannel = {
    id: number
    name: string
    description: string
}

/**
 * The current thread in which the user is browsing content. Is not present in the data if the user is not currently browsing a thread.
 */
export type DoistCardContextThread = {
    id: number
    title: string
}

/**
 * The current conversation in which the user is browsing content. Is not present in the data if the user is not currently browsing a a conversation.
 */
export type DoistCardContextConversation = {
    id: number
    title: string
}

type Message = {
    id: number
    content: string
    posted: Date
}

export type DoistCardContextMessage = Message

export type DoistCardContextComment = Message

export type Theme = 'light' | 'dark'

export type Platform = 'desktop' | 'mobile'

/**
 * Context on which interactions with the adaptive card integration happen.
 */
export type TwistContext = {
    workspace: DoistCardContextWorkspace
    channel?: DoistCardContextChannel
    thread?: DoistCardContextThread
    conversation?: DoistCardContextConversation
    message?: DoistCardContextMessage
    comment?: DoistCardContextComment
}

/**
 * Context from Todoist on which interactions with the adaptive card integration happen.
 */
export type TodoistContext = {
    project: { id: number; name: string }
}

export type DoistCardContext = {
    user: DoistCardContextUser
    theme: Theme
    twist?: TwistContext
    todoist?: TodoistContext
    platform?: Platform
}

/**
 * A top-level object representing a request the integration client does against the integration server.
 */
export type DoistCardRequest = {
    context: DoistCardContext
    action: DoistCardAction
    extensionType: DoistCardExtensionType
    /**
     * This is the maximum version of Doist Card that the requesting client supports. This can be used
     * to send back different cards based on the supported version.
     */
    maximumDoistCardVersion: number | undefined
}

/**
 * Types of actions that the server can invoke on the client via a bridge.
 */
export type DoistCardBridgeActionType = 'composer.append' | 'finished' | 'display.notification'

/**
 * The notification display type
 */
export type DoistCardNotificationType = 'success' | 'error' | 'info'

/**
 * The bridge notification. This should be supplied when the `bridgeActionType` is `display.notification`
 */
export type DoistCardBridgeNotification = {
    /**
     * The text that should appear in the notification.
     *
     * NOTE: this should be plain text, Markdown is *not* supported
     */
    text: string
    type: DoistCardNotificationType
    /**
     * The action, this should be a URL and is what will be launched when clicked (if provided)
     */
    actionUrl?: string
    /**
     * This is the text that will be displayed as the notification action, clicking it will take you to
     * what has been assigned to `actionUrl`
     */
    actionText?: string
}

/**
 * The bridge represents actions that the server asks the client to invoke locally,
 * along with necessary parameters to do so.
 */
export type DoistCardBridge = {
    bridgeActionType: DoistCardBridgeActionType
    text?: string
    notification?: DoistCardBridgeNotification
}

/**
 * A top-level object representing a response by the server agains the integration client.
 */
export type DoistCardResponse = {
    card?: DoistCard
    bridges?: DoistCardBridge[]
}

export type DoistCardError = {
    error: Error
    request?: DoistCardRequest
    bridge?: DoistCardBridge
    bridges?: DoistCardBridge[]
}
