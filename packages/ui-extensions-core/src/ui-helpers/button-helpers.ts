import { Column, ColumnSet, Container, Image, TextBlock } from '../doist-card'
import { Action, OpenUrlAction, SubmitAction } from '../doist-card/actions'

import { ICON_SIZE } from './ui-constants'

import type {
    FontSize,
    HorizontalAlignment,
    TextColor,
    VerticalAlignment,
} from '../doist-card/types'

type CreateIconButtonOptions = {
    /**
     * The associated {@link Action} to be executed when the button is clicked.
     */
    action: Action
    /**
     * The text to display on the button.
     */
    buttonText: string
    /**
     * The icon to display on the button.
     */
    iconUrl: string
    /**
     * The color of the button text.
     */
    textColor?: TextColor
    /**
     * If `true`, the button will be displayed in a subtle style.
     */
    isSubtle?: boolean
    /**
     * The size of the icon in the button.
     */
    iconSize?: number
}

/**
 * Creates a button with a title and an optional icon.
 * @param {CreateIconButtonOptions} options - The options with which the button will be created.
 * @return {ColumnSet} A ColumnSet that can be added to a card.
 */
export function createIconButton(options: CreateIconButtonOptions): ColumnSet {
    const {
        action,
        buttonText,
        iconUrl,
        textColor = 'default',
        isSubtle = true,
        iconSize = ICON_SIZE,
    } = options

    return ColumnSet.fromWithColumns({
        selectAction: action,
        columns: [
            // iconColumn
            Column.fromWithItems({
                width: 'auto',
                spacing: 'none',
                items: [
                    Image.from({
                        url: iconUrl,
                        altText: buttonText,
                        pixelHeight: iconSize,
                        pixelWidth: iconSize,
                    }),
                ],
            }),
            // textColumn
            Column.fromWithItems({
                width: 'auto',
                spacing: 'small',
                verticalContentAlignment: 'center',
                items: [
                    TextBlock.from({
                        text: buttonText,
                        isSubtle: isSubtle && textColor !== 'accent',
                        color: textColor,
                    }),
                ],
            }),
        ],
    })
}

type CreateTextButtonOptions = {
    /**
     * The text to be displayed
     */
    text: string
    /**
     * The id of the button
     */
    id?: string
    /**
     * Any associated data to go on the button
     */
    data?: () => Record<string, unknown> | undefined
    /**
     * If `true` the text will be subtle style
     */
    isSubtle?: boolean
    /**
     * The color of the text
     */
    color?: TextColor
    /**
     * The URL to navigate to. If this is set, the button will be an OpenUrlAction.
     */
    url?: string
    /**
     * The horizontal alignment of the text
     */
    horizontalAlignment?: HorizontalAlignment
    /**
     * The vertical alignment of the text
     */
    verticalAlignment?: VerticalAlignment
    /**
     * The size of the text
     */
    textSize?: FontSize
}

/**
 * Creates a button that is purely text and will display as just text.
 * @param {CreateTextButtonOptions} options - The options with which the button will be created.
 * @return {Container} A Container that can be added to a card.
 */
export function createTextButton(options: CreateTextButtonOptions): Container {
    const {
        text,
        id,
        data,
        isSubtle = false,
        color,
        url,
        horizontalAlignment,
        verticalAlignment,
        textSize,
    } = options

    const textBlock = TextBlock.from({
        isSubtle,
        color: color ?? 'default',
        size: textSize ?? 'default',
        text,
        horizontalAlignment,
    })

    const button = url
        ? OpenUrlAction.from({
              url,
              title: text,
          })
        : SubmitAction.from({
              id: id,
              associatedInputs: 'none',
              data: data?.(),
          })

    return Container.fromWithItems({
        selectAction: button,
        verticalContentAlignment: verticalAlignment ?? 'center',
        items: [textBlock],
    })
}
