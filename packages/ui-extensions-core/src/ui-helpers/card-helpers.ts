import { TodoistCard } from '../todoist-card'

import type { TodoistCardVersion } from '../todoist-card'

/**
 * Creates an empty TodoistCard
 */
export function createEmptyCard(todoistCardVersion?: TodoistCardVersion): TodoistCard {
    return TodoistCard.from({ todoistCardVersion: todoistCardVersion || '0.5' })
}
