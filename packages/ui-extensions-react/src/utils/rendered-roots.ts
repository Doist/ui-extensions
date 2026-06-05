import type { Root } from 'react-dom/client'

/**
 * Internal coordination for `AdaptiveCardRenderer`. Roots created during a
 * synchronous `adaptiveCard.render()` are registered here, then retrieved by
 * `takeRenderedRoots()` so the host can unmount them when the card is replaced.
 *
 * This module is intentionally not re-exported from `utils/index.ts`: it is a
 * private rendering detail and must stay out of the package's public API.
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
