import fetch from 'node-fetch'

/**
 * Adds missing global access for fetch.
 * This is needed as the adaptivecards library requires it to work.
 */
export function polyfillFetch(): void {
    if ('fetch' in globalThis) {
        return
    }

    globalThis.fetch = fetch as unknown as (
        input: RequestInfo | URL,
        init?: RequestInit,
    ) => Promise<Response>
}
