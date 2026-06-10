import type { Root } from 'react-dom/client'

/**
 * Tracks the React roots a card render mounts so `AdaptiveCardRenderer` can unmount them
 * later. Roots registered outside a render (e.g. a clicked `Action.ShowCard`) are dropped,
 * not mis-attributed to another render.
 *
 * @private
 */
let trackedRoots: Root[] | null = null

/**
 * Track the roots registered while `render` runs into `roots`. Safe to nest because it
 * saves and restores the previous render's array.
 */
export function trackRootsDuringCardRender<T>(roots: Root[], render: () => T): T {
    const previous = trackedRoots
    trackedRoots = roots
    try {
        return render()
    } finally {
        trackedRoots = previous
    }
}

export function registerRenderedRoot(root: Root): void {
    if (trackedRoots) {
        trackedRoots.push(root)
        return
    }
    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
            'registerRenderedRoot called outside an AdaptiveCardRenderer render; the root ' +
                'will not be tracked for cleanup (e.g. a custom input inside a lazily-expanded ' +
                'Action.ShowCard, which is unsupported).',
        )
    }
}
