import { createLogoWithText } from './headers'
import { HEADER_COLUMN_ID, HEADER_IMAGE_ID, HEADER_TITLE_ID } from './ui-constants'

import type { ColumnSet, SubmitAction } from '../doist-card'
import type { Image, TextBlock } from '../doist-card/card-elements'

describe('headers', () => {
    test('createLogoHeader creates the header items correctly', () => {
        const result = createLogoWithText({
            logoUrl: 'https://doist.com/images/kwijibo.png',
            headerText: 'Login to Kwijibo',
        })

        const headerImage = result.getElementById(HEADER_IMAGE_ID) as Image
        const headerTitle = result.getElementById(HEADER_TITLE_ID) as TextBlock
        const headerColumns = result.getElementById(HEADER_COLUMN_ID) as ColumnSet

        // Image checks
        expect(headerImage.pixelHeight).toEqual(24)
        expect(headerImage.url).toEqual('https://doist.com/images/kwijibo.png')

        // Title checks
        expect(headerTitle.text).toEqual('Login to Kwijibo')
        expect(headerTitle.size).toEqual('default')
        expect(headerTitle.weight).toEqual('bolder')

        // ColumnSet checks
        expect(headerColumns.selectAction).not.toBeUndefined()

        // Action checks
        expect((headerColumns.selectAction as SubmitAction).associatedInputs).toEqual('none')
        expect((headerColumns.selectAction as SubmitAction).id).toEqual('Action.GoHome')
    })
})
