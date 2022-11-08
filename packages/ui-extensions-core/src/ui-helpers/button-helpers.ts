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
    action: Action
    buttonText: string
    iconUrl: string
    textColor?: TextColor
    isSubtle?: boolean
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
    text: string
    id?: string
    data?: () => Record<string, unknown> | undefined
    isSubtle?: boolean
    color?: TextColor
    url?: string
    horizontalAlignment?: HorizontalAlignment
    verticalAlignment?: VerticalAlignment
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
