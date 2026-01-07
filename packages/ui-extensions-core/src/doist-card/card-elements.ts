import { JsonProperty, JsonObject } from 'typescript-json-serializer'

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

/**
 * The DoistCard is the root object into which all other elements and cards can be added.
 * @extends ContainerWithNoItems
 */
@JsonObject()
export class DoistCard extends ContainerWithNoItems {
    static readonly schemaUrl = 'http://adaptivecards.io/schemas/adaptive-card.json'

    @JsonProperty('doistCardVersion')
    private _doistCardVersion: DoistCardVersion = '0.3'

    @JsonProperty('adaptiveCardistVersion')
    private _adaptiveCardistVersion: DoistCardVersion = '0.3'

    /**
     * The version of the DoistCard. This version tells the requesting client what version of
     * DoistCard you require and that lets the client know whether they can render this or not.
     *
     * If you choose a version that is higher than a supported client, your card may not get rendered
     * properly.
     */
    get doistCardVersion(): DoistCardVersion {
        // When we remove `adaptiveCardistVersion` we can remove this line, until then,
        // we should keep it as it ensures that the _adaptiveCardistVersion field doesn't
        // get removed by accident.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this._adaptiveCardistVersion
        return this._doistCardVersion
    }

    set doistCardVersion(value: DoistCardVersion) {
        this._doistCardVersion = value
        this._adaptiveCardistVersion = value
    }

    /**
     * The ID of the input element that should be focused when the card is initially shown.
     */
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

    /**
     * Add an {@Link Action} to the card.
     * @param {Action} action - The action you want to appear at the bottom of the card.
     */
    addAction(action: Action): void {
        if (!this.actions) this.actions = []

        this.actions.push(action)
    }
    /**
     * Add a {@link CardElement} to the card.
     * @param {CardElement} item - The item to be added to the card. These should be added in the order you want them to appear.
     */
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

    /**
     * Create an instance of the DoistCard.
     * @summary Create an instance of the DoistCard and be able to pass items in through an array, as well being
     * able to pass in the other properties.
     * @param props - The properties of the DoistCard and the additional items array.
     * @return {DoistCard} An instance of {@link DoistCard}.
     */
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
/**
 * The base TextBlock class. This contains the common properties between TextBlock,
 * RichTextBlock and TextRun.
 * @extends CardElement
 */
@JsonObject()
export abstract class TextBlockBase extends CardElement {
    constructor(text?: string) {
        super()
        if (text) {
            this.text = text
        }
    }

    /**
     * The text to be displayed.
     */
    @JsonProperty()
    text!: string

    /**
     * The color of the text.
     * This can be "default" | "dark" | "light" | "accent" | "good" | "warning" | "attention"
     *
     * The actual values of those colors are determined by the client.
     */
    @JsonProperty()
    color?: TextColor

    /**
     * The type of font to use.
     *
     * This can be "default" | "monospace"
     *
     * Monospace is a fixed width font, which is useful for displaying code.
     */
    @JsonProperty()
    fontType?: FontType

    /**
     * Determins whether the text should be displayed in a more subtle format.
     * This is useful for displaying secondary information.
     */
    @JsonProperty()
    isSubtle?: boolean

    /**
     * The size of the font.
     * This can be "default" | "small" | "medium" | "large" | "extraLarge"
     *
     * The actual values of theses sizes are determined by the client.
     */
    @JsonProperty()
    size?: FontSize

    /**
     * The font weight of the text.
     *
     * This can be "default" | "lighter" | "bolder"
     *
     * The actual values of theses weights are determined by the client.
     */
    @JsonProperty()
    weight?: FontWeight
}

/**
 * The TextBlock element, used for displaying text in your card.
 * @extends TextBlockBase
 */
@JsonObject()
export class TextBlock extends TextBlockBase {
    /**
     * Whether the text should be wrapped if it proves to be too long for a single line.
     */
    @JsonProperty()
    wrap?: boolean

    /**
     * Which style of text to use.
     *
     * This can be "default" | "heading"
     */
    @JsonProperty()
    style?: TextBlockStyle

    protected getJsonTypeName(): string {
        return 'TextBlock'
    }
}
/**
 * Display an image in your card using this class.
 * @extends CardElement
 */
@JsonObject()
export class Image extends CardElement {
    /**
     * The URL of the image.
     */
    @JsonProperty()
    url!: string

    /**
     * The alt text for the image.
     */
    @JsonProperty()
    altText?: string

    /**
     * An associated {@link Action} to be invoked when the image is tapped.
     */
    @JsonProperty()
    selectAction?: Action

    /**
     * The size of the image.
     *
     * This can be "auto" | "stretch" | "small" | "medium" | "large"
     *
     * The actual values of those sizes are determined by the client.
     */
    @JsonProperty()
    size?: ImageSize

    /**
     * The style of the image.
     *
     * This can be "default" | "person"
     *
     * The actual behavior of those styles are determined by the client. But "person" is usually
     * used to display a circular image.
     */
    @JsonProperty()
    style?: ImageStyle

    /**
     * The width of the image.
     */
    @JsonProperty()
    width?: string

    /**
     * The aspect ratio of the image. Whilst not required, it is recommended to provide this to
     * assist mobile clients to render spacing correctly whilst the image is loading.
     */
    @JsonProperty()
    aspectRatio?: number

    /**
     * The explicit height of the image.
     */
    @JsonProperty({
        name: 'height',
        afterSerialize: function (pixelHeight?: ImageHeight): string | undefined {
            if (!pixelHeight) return undefined
            return typeof pixelHeight === 'number' ? `${pixelHeight}px` : pixelHeight
        },
    })
    pixelHeight?: ImageHeight

    /**
     * The explicit width of the image.
     */
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
/**
 * A TextRun is used by the RichTextBlock to display text in a formatted way.
 * @extends TextBlockBase
 */
@JsonObject()
export class TextRun extends TextBlockBase {
    /**
     * An associated {@link Action} to be invoked when the image is tapped.
     */
    @JsonProperty()
    selectAction?: Action

    protected getJsonTypeName(): string {
        return 'TextRun'
    }
}

export type Inline = TextRun | string

/**
 * The element used to display rich text. This is similar to the TextBlock element, but allows
 * for more formatting. You can pass in a number of different Inline elements.
 * @extends CardElement
 */
@JsonObject()
export class RichTextBlock extends CardElement {
    @JsonProperty()
    private inlines: Inline[] = []

    /**
     * Add an {@link Inline} element to this RichTextBlock.
     * @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
     * @return {ReturnValueDataTypeHere} Brief description of the returning value here.
     */

    addInline(inline: Inline): void {
        this.inlines.push(inline)
    }

    getInlineAt(index: number): Inline {
        return this.inlines[index]
    }

    protected getJsonTypeName(): string {
        return 'RichTextBlock'
    }

    /**
     * Create an instance of the RichTextBlock.
     * @summary Create an instance of the RichTextBlock and be able to pass inlines in through an array, as well being
     * able to pass in the other properties.
     * @param props - The properties of the RichTextBlock and the additional inlines array.
     * @return {RichTextBlock} An instance of {@link RichTextBlock}.
     */
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
