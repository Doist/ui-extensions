import { CardElement, Column, ColumnSet, Container, Image, TextBlock } from '../doist-card'
import { Action, OpenUrlAction, SubmitAction } from '../doist-card/actions'

import { ICON_SIZE } from './ui-constants'

import type {
    FontSize,
    HorizontalAlignment,
    TextColor,
    VerticalAlignment,
} from '../doist-card/types'

export function createIconButton(options: {
    action: Action
    buttonText: string
    iconUrl: string
    textColor?: TextColor
    isSubtle?: boolean
    iconSize?: number
}): CardElement {
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

export function createTextButton(options: {
    text: string
    id?: string
    data?: () => Record<string, unknown> | undefined
    isSubtle?: boolean
    color?: TextColor
    url?: string
    horizontalAlignment?: HorizontalAlignment
    verticalAlignment?: VerticalAlignment
    textSize?: FontSize
}): CardElement {
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
