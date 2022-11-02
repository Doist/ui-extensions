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

export type TodoistContextMenuSource = 'project' | 'task'
