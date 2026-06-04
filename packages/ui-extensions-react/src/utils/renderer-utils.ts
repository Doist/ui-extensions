import type { Root } from 'react-dom/client'

export function createInputContainer(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'ac-input-container'
    return div
}

/**
 * Roots created during a synchronous `adaptiveCard.render()`, then retrieved by
 * `takeRenderedRoots()` so the host can unmount them when the card is replaced.
 */
let pendingRoots: Root[] = []

export function registerRenderedRoot(root: Root): void {
    pendingRoots.push(root)
}

export function takeRenderedRoots(): Root[] {
    const roots = pendingRoots
    pendingRoots = []
    return roots
}
