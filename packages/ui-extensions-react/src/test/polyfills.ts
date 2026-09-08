import { TextDecoder, TextEncoder } from 'util'

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

    // TextEncoder and TextDecoder are required by node-fetch v3
    if (!('TextEncoder' in globalThis)) {
        globalThis.TextEncoder = TextEncoder
    }
    if (!('TextDecoder' in globalThis)) {
        globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder
    }
}
