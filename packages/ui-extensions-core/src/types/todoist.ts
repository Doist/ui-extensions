import type { DoistContextUser } from './doist'

type TodoistIdAndName = { id: string; name: string }

/**
 * The current project in which the user is browsing content. Is not present in the data if the user is not currently browsing a project.
 */
export type TodoistContextProject = TodoistIdAndName

/**
 * The current label in which the user is browsing content. Is not present in the data if the user is not currently browsing a label.
 */
export type TodoistContextLabel = TodoistIdAndName

/**
 * The current filter in which the user is browsing content. Is not present in the data if the user is not currently browsing a filter.
 */
export type TodoistContextFilter = TodoistIdAndName

/**
 * Context from Todoist on which interactions with the adaptive card integration happen.
 */
export type TodoistContext = {
    /**
     * Project may not exist as Todoist could be on Today/Upcoming/Filters
     */
    project?: TodoistContextProject
    filter?: TodoistContextFilter
    label?: TodoistContextLabel
    additionalUserContext: {
        isPro: boolean
    }
}

/**
 * When a context menu extension is triggered, the data will be sent in the
 * `params` field of the `DoistCardAction`. This type will allow you to
 * cast that data to something specific.
 */
export type TodoistContextMenuData = {
    /**
     * The deep link back to the source
     */
    url: string
    /**
     * The id of the source object
     */
    sourceId: string
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
    source: TodoistContextMenuSource

    /**
     * The date the content was posted. For projects, this will be null.
     * For tasks this will be the date the task was created.
     */
    postedDate?: Date
}

export type TodoistContextMenuSource = 'project' | 'task'

export type TodoistContextUser = DoistContextUser & {
    id: string
}
