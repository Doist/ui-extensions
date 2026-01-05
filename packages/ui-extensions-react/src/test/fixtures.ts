import { AdaptiveCardistCard } from '../types/doist-rendering'

import type { DoistCardContext } from '@doist/ui-extensions-core'

export const DEFAULT_SERVER_ROOT = 'https://server.com'
export const DEFAULT_SERVER_RELATIVE_PATH = '/process'
export const DEFAULT_SERVER_ABSOLUTE_PATH = `${DEFAULT_SERVER_ROOT}${DEFAULT_SERVER_RELATIVE_PATH}`
export const DEFAULT_TOKEN = 'kwijibo'

export const DEFAULT_CONTEXT_V2: DoistCardContext = {
    user: {
        email: 'my@email.com',
        first_name: 'Mariko',
        id: 4,
        lang: 'jp',
        name: 'Mariko Uhehara',
        short_name: 'Mariko U.',
        timezone: 'Japan/Tokyo',
    },
    twist: {
        workspace: {
            id: 45646,
            name: 'Tokyo Labs',
        },
    },
    theme: 'dark',
}

export const DEFAULT_CARD = {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.3',
    doistCardVersion: '0.2',
    body: [
        {
            type: 'Input.Text',
            id: 'TextInput.Search',
            value: 'hello',
            placeholder: 'Search here...',
            inlineAction: {
                type: 'Action.Submit',
                id: 'Action.Search',
                title: 'Search GIFs',
            },
        },
        {
            type: 'ImageSet',
            imageSize: 'Large',
            images: [
                {
                    type: 'Image',
                    url: 'https://media1.giphy.com/media/XYot661SFS62c/giphy.gif?cid=550add23837d0fdf40feddd3a4df0de03a98b54019e5cffc&rid=giphy.gif',
                    altText: 'robin williams hello GIF',
                },
                {
                    type: 'Image',
                    url: 'https://media1.giphy.com/media/icUEIrjnUuFCWDxFpU/giphy.gif?cid=550add23837d0fdf40feddd3a4df0de03a98b54019e5cffc&rid=giphy.gif',
                    altText: 'Napoleon Dynamite Hello GIF by 20th Century Fox Home Entertainment',
                },
                {
                    type: 'Image',
                    url: 'https://media3.giphy.com/media/BVStb13YiR5Qs/giphy.gif?cid=550add23837d0fdf40feddd3a4df0de03a98b54019e5cffc&rid=giphy.gif',
                    altText: 'Lionel Richie Hello GIF',
                },
            ],
        },
    ],
}

export function getDefaultCard(): AdaptiveCardistCard {
    const card = new AdaptiveCardistCard()
    card.parse(DEFAULT_CARD)
    return card
}
