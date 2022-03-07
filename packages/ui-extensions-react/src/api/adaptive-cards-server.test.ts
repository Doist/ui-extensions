import nock, { Scope } from 'nock'

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
    it('response contains card and is deserialized into an object', async () => {
        mockOkReplyStrict(nock(DEFAULT_SERVER_ROOT), DEFAULT_CARD)

        const { card } = await processRequest<ExtensionRequest, DoistCardResponse>(
            {
                context: DEFAULT_CONTEXT_V2,
                action: {
                    actionType: 'initial',
                },
                extensionType: 'composer',
                maximumDoistCardVersion: 0.3,
            },
            DEFAULT_SERVER_ABSOLUTE_PATH,
            DEFAULT_TOKEN,
        )

        expect(typeof card).toBe('object')
        expect(card).toEqual(DEFAULT_CARD)
    })
})
