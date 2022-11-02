/**
 * Context on which interactions with the adaptive card integration happen.
 */
export type TwistContext = {
    workspace: TwistContextWorkspace
    channel?: TwistContextChannel
    thread?: TwistContextThread
    conversation?: TwistContextConversation
    message?: TwistContextMessage
    comment?: TwistContextComment
}

/**
 * The workspace where the user is currently browsing content.
 */
export type TwistContextWorkspace = {
    id: number
    name: string
}

/**
 * The current channel in which the user is browsing content. Is not present in the data if the user is not currently browsing a channel.
 */
export type TwistContextChannel = {
    id: number
    name: string
    description: string
}

/**
 * The current thread in which the user is browsing content. Is not present in the data if the user is not currently browsing a thread.
 */
export type TwistContextThread = {
    id: number
    title: string
}

/**
 * The current conversation in which the user is browsing content. Is not present in the data if the user is not currently browsing a a conversation.
 */
export type TwistContextConversation = {
    id: number
    title: string
}

type TwistMessage = {
    id: number
    content: string
    posted: Date
}

export type TwistContextMessage = TwistMessage

export type TwistContextComment = TwistMessage

export type TwistContextMenuSource = 'message' | 'thread' | 'comment'
