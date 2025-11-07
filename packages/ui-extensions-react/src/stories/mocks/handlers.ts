import {
    ActionSet,
    ClipboardAction,
    DoistCard,
    OpenUrlAction,
    TextBlock,
} from '@doist/ui-extensions-core'

import { http, HttpResponse } from 'msw'

export const handlers = [
    http.post('/error-card/process', () => {
        return HttpResponse.json({ card: errorCard() })
    }),
]

function errorCard() {
    const card = new DoistCard()
    card.doistCardVersion = '0.6'

    card.verticalContentAlignment = 'center'
    card.minHeight = 200

    const textBlock = new TextBlock('This is an error card')
    textBlock.id = 'ErrorCard.1'
    textBlock.horizontalAlignment = 'center'
    textBlock.wrap = true

    card.addItem(textBlock)

    // Actions
    const actions = new ActionSet()
    actions.id = 'Actions'

    const urlButton = new OpenUrlAction()
    urlButton.url = 'https://www.doist.com'
    urlButton.style = 'positive'
    urlButton.title = 'Open Url'
    actions.addAction(urlButton)

    const clipboardButton = new ClipboardAction()
    clipboardButton.style = 'positive'
    clipboardButton.title = 'Copy Text'
    clipboardButton.text = JSON.stringify({
        uniqueId: '872971b8-f394-48a1-a1c1-ec297d372880',
        error: 'Something went wrong 😅',
    })

    actions.addAction(clipboardButton)

    card.addItem(actions)

    return card
}
