import {
    CardElement,
    Column,
    ColumnSet,
    HorizontalAlignment,
    Image,
    SubmitAction,
    TextBlock,
} from '../doist-card'

import { HEADER_COLUMN_ID, HEADER_IMAGE_ID, HEADER_TITLE_ID, ICON_SIZE } from './ui-constants'

export function createHeader(options: {
    leftColumnItems: CardElement[]
    rightColumnItems: CardElement[]
    middleColumnItems: CardElement[]
    includeEmptySpacing?: boolean
    emptySpaceImageUrl?: string
}): CardElement {
    const {
        leftColumnItems,
        rightColumnItems,
        middleColumnItems,
        includeEmptySpacing = true,
        emptySpaceImageUrl,
    } = options

    function createEmptyImage() {
        return Image.from({
            url: emptySpaceImageUrl,
            pixelHeight: ICON_SIZE,
            pixelWidth: ICON_SIZE,
        })
    }

    const leftColumn = new Column('auto')
    leftColumn.verticalContentAlignment = 'center'

    const middleColumn = new Column('stretch')
    middleColumn.verticalContentAlignment = 'center'

    const rightColumn = new Column('auto')

    if (leftColumnItems.length > 0) {
        leftColumnItems.forEach((x) => leftColumn.addItem(x))
    } else if (includeEmptySpacing && Boolean(emptySpaceImageUrl)) {
        leftColumn.addItem(createEmptyImage())
    }

    if (middleColumnItems.length > 0) {
        middleColumnItems.forEach((x) => middleColumn.addItem(x))
    } else if (includeEmptySpacing && Boolean(emptySpaceImageUrl)) {
        middleColumn.addItem(createEmptyImage())
    }

    if (rightColumnItems.length > 0) {
        rightColumnItems.forEach((x) => rightColumn.addItem(x))
    } else if (includeEmptySpacing && Boolean(emptySpaceImageUrl)) {
        rightColumn.addItem(createEmptyImage())
    }

    const header = ColumnSet.from({ spacing: 'medium' })
    header.spacing = 'medium'
    if (leftColumn.getItemCount() > 0) {
        header.addColumn(leftColumn)
    }
    if (middleColumn.getItemCount() > 0) {
        header.addColumn(middleColumn)
    }
    if (rightColumn.getItemCount() > 0) {
        header.addColumn(rightColumn)
    }

    return header
}

export function createLogoWithTextHeader(options: {
    logoUrl: string
    headerText: string
    horizontalAlignment?: HorizontalAlignment
    headerButtonId?: string
}): CardElement {
    const {
        headerText,
        logoUrl,
        horizontalAlignment = 'center',
        headerButtonId = 'Action.GoHome',
    } = options

    return ColumnSet.fromWithColumns({
        id: HEADER_COLUMN_ID,
        horizontalAlignment,
        spacing: 'medium',
        selectAction: SubmitAction.from({
            id: headerButtonId,
            associatedInputs: 'none',
        }),
        columns: [
            // logoColumn
            Column.fromWithItems({
                width: 'auto',
                items: [
                    Image.from({
                        id: HEADER_IMAGE_ID,
                        url: logoUrl,
                        pixelHeight: ICON_SIZE,
                        aspectRatio: 1,
                    }),
                ],
            }),
            // titleColumn
            Column.fromWithItems({
                width: 'auto',
                verticalContentAlignment: 'center',
                items: [
                    TextBlock.from({
                        id: HEADER_TITLE_ID,
                        size: 'default',
                        weight: 'bolder',
                        horizontalAlignment,
                        text: headerText,
                    }),
                ],
            }),
        ],
    })
}
