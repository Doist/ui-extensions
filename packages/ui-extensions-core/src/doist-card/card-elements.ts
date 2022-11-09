import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { Action } from './actions'
import { CardElement } from './card-element'
import { ContainerWithNoItems } from './containers'

import type { Props } from './props'
import type {
    DoistCardVersion,
    FontSize,
    FontType,
    FontWeight,
    ImageHeight,
    ImageSize,
    ImageStyle,
    ImageWidth,
    TextBlockStyle,
    TextColor,
} from './types'

@Serializable()
export class DoistCard extends ContainerWithNoItems {
    static readonly schemaUrl = 'http://adaptivecards.io/schemas/adaptive-card.json'

    @JsonProperty('doistCardVersion')
    private _doistCardVersion: DoistCardVersion = '0.3'

    @JsonProperty('adaptiveCardistVersion')
    private _adaptiveCardistVersion: DoistCardVersion = '0.3'

    get doistCardVersion(): DoistCardVersion {
        // When we remove `adaptiveCardistVersion` we can remove this line, until then,
        // we should keep it as it ensures that the _adaptiveCardistVersion field doesn't
        // get removed by accident.
        // eslint-disable-next-line no-unused-expressions
        this._adaptiveCardistVersion
        return this._doistCardVersion
    }

    set doistCardVersion(value: DoistCardVersion) {
        this._doistCardVersion = value
        this._adaptiveCardistVersion = value
    }

    @JsonProperty()
    autoFocusId?: string

    @JsonProperty()
    readonly $schema = DoistCard.schemaUrl

    /**
     * This is the adaptive card version that we are currently supporting,
     * this is non-configurable.
     */
    @JsonProperty()
    readonly version = '1.4'

    @JsonProperty('body')
    private items: CardElement[] = []

    @JsonProperty('actions')
    private actions?: Action[]

    addAction(action: Action): void {
        if (!this.actions) this.actions = []

        this.actions.push(action)
    }

    addItem(item: CardElement): void {
        this.items.push(item)
    }

    protected getJsonTypeName(): string {
        return 'AdaptiveCard'
    }

    getItemCount(): number {
        return this.items.length
    }

    getItemAt(index: number): CardElement {
        return this.items[index]
    }

    getActionById(id: string): Action | undefined {
        let result: Action | undefined = super.getActionById(id)

        if (!result) {
            if (this.selectAction) {
                result = this.selectAction.getActionById(id)
            }

            if (!result) {
                for (const item of this.items) {
                    result = item.getActionById(id)

                    if (result) {
                        break
                    }
                }
            }
        }

        return result
    }

    static fromWithItems<T extends DoistCard>(
        this: new () => T,
        props: Props<T> & { items?: CardElement[] },
    ): T {
        const o = new this()
        const { items, ...rest } = props
        Object.assign(o, rest)
        if (items && items.length > 0) {
            items.forEach((item) => o.addItem(item))
        }
        return o
    }
}

@Serializable()
export abstract class TextBlockBase extends CardElement {
    constructor(text?: string) {
        super()
        if (text) {
            this.text = text
        }
    }

    @JsonProperty()
    text!: string

    @JsonProperty()
    color?: TextColor

    @JsonProperty()
    fontType?: FontType

    @JsonProperty()
    isSubtle?: boolean

    @JsonProperty()
    size?: FontSize

    @JsonProperty()
    weight?: FontWeight
}

@Serializable()
export class TextBlock extends TextBlockBase {
    @JsonProperty()
    maxLines?: number

    @JsonProperty()
    wrap?: boolean

    @JsonProperty()
    style?: TextBlockStyle

    protected getJsonTypeName(): string {
        return 'TextBlock'
    }
}

@Serializable()
export class Image extends CardElement {
    @JsonProperty()
    url!: string

    @JsonProperty()
    altText?: string

    @JsonProperty()
    selectAction?: Action

    @JsonProperty()
    size?: ImageSize

    @JsonProperty()
    style?: ImageStyle

    @JsonProperty()
    width?: string

    @JsonProperty()
    aspectRatio?: number

    @JsonProperty({
        name: 'height',
        afterSerialize: function (pixelHeight?: ImageHeight): string | undefined {
            if (!pixelHeight) return undefined
            return typeof pixelHeight === 'number' ? `${pixelHeight}px` : pixelHeight
        },
    })
    pixelHeight?: ImageHeight

    @JsonProperty({
        name: 'width',
        afterSerialize: function (pixelWidth?: ImageWidth): string | undefined {
            if (!pixelWidth) return undefined
            return typeof pixelWidth === 'number' ? `${pixelWidth}px` : pixelWidth
        },
    })
    pixelWidth?: ImageWidth

    protected getJsonTypeName(): string {
        return 'Image'
    }

    getActionById(id: string): Action | undefined {
        let result = super.getActionById(id)

        if (!result && this.selectAction) {
            result = this.selectAction.getActionById(id)
        }

        return result
    }
}

@Serializable()
export class TextRun extends TextBlockBase {
    @JsonProperty()
    italic?: boolean

    @JsonProperty()
    strikethrough?: boolean

    @JsonProperty()
    highlight?: boolean

    @JsonProperty()
    underline?: boolean

    @JsonProperty()
    selectAction?: Action

    protected getJsonTypeName(): string {
        return 'TextRun'
    }
}

export type Inline = TextRun | string

@Serializable()
export class RichTextBlock extends CardElement {
    @JsonProperty()
    private inlines: Inline[] = []

    addInline(inline: Inline): void {
        this.inlines.push(inline)
    }

    getInlineAt(index: number): Inline {
        return this.inlines[index]
    }

    protected getJsonTypeName(): string {
        return 'RichTextBlock'
    }

    static fromWithInlines<T extends RichTextBlock>(
        this: new () => T,
        props: Props<T> & { inlines?: Inline[] },
    ): T {
        const o = new this()
        const { inlines, ...rest } = props
        Object.assign(o, rest)
        if (inlines && inlines.length > 0) {
            inlines.forEach((inline) => o.addInline(inline))
        }
        return o
    }
}
