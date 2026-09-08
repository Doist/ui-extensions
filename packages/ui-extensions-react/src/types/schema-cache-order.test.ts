import { AdaptiveCard } from 'adaptivecards'

import { AdaptiveCardistCard } from './todoist-rendering'

/**
 * Lives in a file of its own on purpose. The adaptivecards schema cache is a module-level
 * static keyed by `getSchemaKey()` and populated first-writer-wins, so this only reproduces
 * with a fresh module registry — any earlier test that builds an AdaptiveCardistCard would
 * mask it.
 */
describe('schema cache', () => {
    it('parses the card version when a plain AdaptiveCard was built first', () => {
        new AdaptiveCard().parse({ type: 'AdaptiveCard', version: '1.4' })

        const card = new AdaptiveCardistCard()
        card.parse({ type: 'AdaptiveCard', version: '1.4', doistCardVersion: '0.3' })

        // Without a schema key of its own this class shares the base class's cache entry,
        // and every property it declares comes back undefined.
        expect(card.todoistCardVersion).toEqual('0.3')
    })
})
