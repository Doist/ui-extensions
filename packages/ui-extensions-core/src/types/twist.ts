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

/**
 * When a context menu extension is triggered, the data will be sent in the
 * `params` field of the `DoistCardAction`. This type will allow you to
 * cast that data to something specific.
 */
export type TwistContextMenuData = {
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
