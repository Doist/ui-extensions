/**
 * @jest-environment node
 */
import nock from 'nock'

import {
    DEFAULT_CARD,
    DEFAULT_CONTEXT_V2,
    DEFAULT_SERVER_ABSOLUTE_PATH,
    DEFAULT_SERVER_RELATIVE_PATH,
    DEFAULT_SERVER_ROOT,
    DEFAULT_TOKEN,
} from '../test/fixtures'
import { polyfillFetch } from '../test/polyfills'

import { processRequest } from './adaptive-cards-server'

import type { DoistCardResponse } from '@doist/ui-extensions-core'
import type { Scope } from 'nock'
import type { ExtensionRequest } from '../types'

polyfillFetch()

function mockOkReplyStrict(scope: Scope, card: unknown) {
    scope.post(DEFAULT_SERVER_RELATIVE_PATH).reply(
        200,
        { card },
        {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
        },
    )
    scope.options(DEFAULT_SERVER_RELATIVE_PATH).reply(204, undefined, {
        'Access-Control-Allow-Origin': '*',
        'access-control-allow-headers': 'Authorization',
    })
}

describe('Tests for adaptive-cards-server', () => {
    const defaultRequest: ExtensionRequest = {
        context: DEFAULT_CONTEXT_V2,
        action: {
            actionType: 'initial',
        },
        extensionType: 'composer',
        maximumDoistCardVersion: 0.3,
    }

    it('response contains card and is deserialized into an object', async () => {
        mockOkReplyStrict(nock(DEFAULT_SERVER_ROOT), DEFAULT_CARD)

        const { card } = await processRequest<ExtensionRequest, DoistCardResponse>(
            defaultRequest,
            DEFAULT_SERVER_ABSOLUTE_PATH,
            DEFAULT_TOKEN,
        )

        expect(typeof card).toBe('object')
        expect(card).toEqual(DEFAULT_CARD)
    })

    it('returns parsed JSON when server responds with HTTP 429 and a JSON body', async () => {
        const errorCard = {
            card: {
                type: 'AdaptiveCard',
                body: [{ type: 'TextBlock', text: 'Rate limited' }],
            },
        }

        nock(DEFAULT_SERVER_ROOT)
            .post(DEFAULT_SERVER_RELATIVE_PATH)
            .reply(429, errorCard, { 'Content-type': 'application/json' })

        const result = await processRequest<ExtensionRequest, DoistCardResponse>(
            defaultRequest,
            DEFAULT_SERVER_ABSOLUTE_PATH,
            DEFAULT_TOKEN,
        )

        expect(result).toEqual(errorCard)
    })

    it('throws an error when server responds with HTTP 500 and a non-JSON body', async () => {
        nock(DEFAULT_SERVER_ROOT)
            .post(DEFAULT_SERVER_RELATIVE_PATH)
            .reply(500, 'Internal Server Error', { 'Content-type': 'text/plain' })

        await expect(
            processRequest<ExtensionRequest, DoistCardResponse>(
                defaultRequest,
                DEFAULT_SERVER_ABSOLUTE_PATH,
                DEFAULT_TOKEN,
            ),
        ).rejects.toThrow('Request failed with status 500')
    })

    it('throws an error on network failure', async () => {
        nock(DEFAULT_SERVER_ROOT)
            .post(DEFAULT_SERVER_RELATIVE_PATH)
            .replyWithError('Network error')

        await expect(
            processRequest<ExtensionRequest, DoistCardResponse>(
                defaultRequest,
                DEFAULT_SERVER_ABSOLUTE_PATH,
                DEFAULT_TOKEN,
            ),
        ).rejects.toThrow()
    })
})
