/**
 * Types of actions that the server can invoke on the client via a bridge.
 */
export type TodoistCardBridgeActionType = TodoistCardBridge['bridgeActionType']

/**
 * The notification display type
 */
export type TodoistCardNotificationType = 'success' | 'error' | 'info'

/**
 * The bridge notification. This should be supplied when the `bridgeActionType` is `display.notification`
 */
export type TodoistCardBridgeNotification = {
    /**
     * The text that should appear in the notification.
     *
     * NOTE: this should be plain text, Markdown is *not* supported
     */
    text: string
    type: TodoistCardNotificationType
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
 * The bridge action that closes the UI extension within Twist/Todoist.
 */
export type FinishedBridge = {
    bridgeActionType: 'finished'
}

/**
 * The bridge action that inserts text into the relevant text input field.
 */
export type ComposerAppendBridge = {
    bridgeActionType: 'composer.append'
    text: string
}

/**
 * The bridge action that displays a notification and optional action. The action will open a URL in the browser.
 */
export type DisplayNotificationBridge = {
    bridgeActionType: 'display.notification'
    notification: TodoistCardBridgeNotification
}

/**
 * The bridge action that will trigger a sync request in Todoist. The bridge accepts notifications
 * for both success, and error, scenarios.
 */
export type RequestTodoistSyncBridge = {
    bridgeActionType: 'request.sync'
    onSuccessNotification?: TodoistCardBridgeNotification
    onErrorNotification?: TodoistCardBridgeNotification
}

/**
 * The bridge represents actions that the server asks the client to invoke locally,
 * along with necessary parameters to do so.
 */
export type TodoistCardBridge =
    | FinishedBridge
    | ComposerAppendBridge
    | DisplayNotificationBridge
    | RequestTodoistSyncBridge
