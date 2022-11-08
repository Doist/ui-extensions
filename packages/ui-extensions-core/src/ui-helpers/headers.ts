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

type HeaderOptions = {
    /**
     * Items for the left column
     */
    leftColumnItems: CardElement[]
    /**
     * Items for the right column
     */
    rightColumnItems: CardElement[]
    /**
     * Items for the middle column
     */
    middleColumnItems: CardElement[]
    /**
     * The empty space image is required to actually render the empty space.
     */
    emptySpaceImageUrl: string
}

/**
 * This helper function will allow you to create a three-column header.
 * @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
 * @param {HeaderOptions} options - The options for the header.
 * @return {ColumnSet} A ColumnSet element that can be added to a card.
 */
export function createHeader(options: HeaderOptions): ColumnSet {
    const { leftColumnItems, rightColumnItems, middleColumnItems, emptySpaceImageUrl } = options

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
    } else if (emptySpaceImageUrl) {
        leftColumn.addItem(createEmptyImage())
    }

    if (middleColumnItems.length > 0) {
        middleColumnItems.forEach((x) => middleColumn.addItem(x))
    } else if (emptySpaceImageUrl) {
        middleColumn.addItem(createEmptyImage())
    }

    if (rightColumnItems.length > 0) {
        rightColumnItems.forEach((x) => rightColumn.addItem(x))
    } else if (emptySpaceImageUrl) {
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

type LogoWithTextOptions = {
    logoUrl: string
    headerText: string
    horizontalAlignment?: HorizontalAlignment
    /**
     * The ID for the card element's SelectAction.
     */
    headerButtonId?: string
    /**
     * The data for the card element's SelectAction.
     */
    headerButtonData?: () => Record<string, unknown>
}

/**
 * @summary The creates a clickable card element with an image and text side-by-side
 * @param {LogoWithTextOptions} options - The options for creating this item.
 * @return {CardElement} A Doist Card element that can be added to a card.
 */
export function createLogoWithText(options: LogoWithTextOptions): CardElement {
    const {
        headerText,
        logoUrl,
        horizontalAlignment = 'center',
        headerButtonId = 'Action.GoHome',
        headerButtonData,
    } = options

    return ColumnSet.fromWithColumns({
        id: HEADER_COLUMN_ID,
        horizontalAlignment,
        spacing: 'medium',
        selectAction: SubmitAction.from({
            id: headerButtonId,
            associatedInputs: 'none',
            data: headerButtonData ? headerButtonData() : undefined,
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
