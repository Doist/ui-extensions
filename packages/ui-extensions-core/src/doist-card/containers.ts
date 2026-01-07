import { JsonProperty, JsonObject } from 'typescript-json-serializer'

import { Action } from './actions'
import { CardElement } from './card-element'
import { SerializableObject } from './serialization'

import type { Props } from './props'
import type {
    ColumnWidth,
    ContainerStyle,
    HorizontalAlignment,
    ImageFillMode,
    VerticalAlignment,
} from './types'

/**
 * Specifies a background image. Acceptable formats are PNG, JPEG, and GIF
 * @extends SerializableObject
 */
@JsonObject()
export class BackgroundImage extends SerializableObject {
    /**
     * The URL (or data URL) of the image. Acceptable formats are PNG, JPEG, and GIF.
     */
    @JsonProperty()
    url!: string

    /**
     * Describes how the image should fill the area.
     *
     * @defaultValue `cover`
     */
    @JsonProperty()
    fillMode?: ImageFillMode

    /**
     * Describes how the image should be aligned if it must be cropped or if using repeat fill mode.
     */
    @JsonProperty()
    horizontalAlignment?: HorizontalAlignment

    /**
     * Describes how the image should be aligned if it must be cropped or if using repeat fill mode.
     */
    @JsonProperty()
    verticalAlignment?: VerticalAlignment
}
/**
 * Base class for all containers.
 * @extends CardElement
 */
@JsonObject()
export abstract class ContainerBase extends CardElement {
    /**
     * Determines whether the element should bleed through its parent's padding.
     */
    @JsonProperty()
    bleed?: boolean

    /**
     * Specifies the minimum height of the container in pixels, like `50`.
     */
    @JsonProperty({
        name: 'minHeight',
        afterSerialize: function (minHeight?: number): string | undefined {
            if (!minHeight) return undefined
            return `${minHeight}px`
        },
    })
    minHeight?: number

    /**
     * An associated {@link Action} to be invoked when the container is tapped.
     */
    @JsonProperty()
    selectAction?: Action

    abstract getItemCount(): number
    abstract getItemAt(index: number): CardElement

    getElementById(id: string): CardElement | undefined {
        let result = super.getElementById(id)

        if (!result) {
            for (let i = 0; i < this.getItemCount(); i++) {
                result = this.getItemAt(i).getElementById(id)

                if (result) {
                    break
                }
            }
        }

        return result
    }
}

@JsonObject()
export abstract class ContainerWithNoItems extends ContainerBase {
    /**
     * Defines how the content should be aligned vertically within the container.
     * When not specified, the value of verticalContentAlignment is inherited from the
     * parent container. If no parent container has verticalContentAlignment set,
     * it defaults to Top.
     */
    @JsonProperty()
    verticalContentAlignment?: VerticalAlignment

    @JsonProperty('backgroundImage')
    private background?: BackgroundImage

    /**
     * Specifies the background image. Acceptable formats are PNG, JPEG, and GIF
     */
    get backgroundImage(): BackgroundImage {
        if (!this.background) {
            this.background = new BackgroundImage()
        }

        return this.background
    }

    set backgroundImage(image: BackgroundImage) {
        this.background = image
    }

    /**
     * Style hint for the container.
     */
    @JsonProperty()
    style?: ContainerStyle

    @JsonProperty()
    selectAction?: Action
}

@JsonObject()
export class Container extends ContainerWithNoItems {
    @JsonProperty('items')
    private items: CardElement[] = []

    /**
     * Add a {@link CardElement} to the container.
     * @param item a valid {@link CardElement} item.
     */
    addItem(item: CardElement): void {
        this.insertItemAt(item, -1)
    }

    getItemAt(index: number): CardElement {
        return this.items[index]
    }

    indexOf(cardElement: CardElement): number {
        return this.items.indexOf(cardElement)
    }

    removeItem(item: CardElement): boolean {
        const itemIndex = this.items.indexOf(item)

        if (itemIndex >= 0) {
            this.items.splice(itemIndex, 1)

            return true
        }

        return false
    }

    /**
     * Clear the list of items in this container.
     */
    clear(): void {
        this.items = []
    }

    getItemCount(): number {
        return this.items.length
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

    protected insertItemAt(item: CardElement, index: number): void {
        if (index < 0 || index >= this.items.length) {
            this.items.push(item)
        } else {
            this.items.splice(index, 0, item)
        }
    }

    protected getJsonTypeName(): string {
        return 'Container'
    }

    /**
     * Create an instance of the Container.
     * @summary Create an instance of the Container and be able to pass items in through an array, as well being
     * able to pass in the other properties.
     * @param props - The properties of the Container and the additional items array.
     * @return {T} An instance of {@link T}.
     */
    static fromWithItems<T extends Container>(
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
 * Displays a set of actions.
 */
@JsonObject()
export class ActionSet extends CardElement {
    @JsonProperty()
    private actions: Action[] = []

    /**
     * Adds an {@link Action} to the action set.
     * @param action a valid {@link Action} item.
     */
    addAction(action: Action): void {
        this.actions.push(action)
    }

    protected getJsonTypeName(): string {
        return 'ActionSet'
    }

    get horizontalAlignment(): HorizontalAlignment | undefined {
        return undefined
    }

    /**
     * This property is not supported in ActionSet
     */
    set horizontalAlignment(_value: HorizontalAlignment | undefined) {
        throw new Error('horizontalAlignment is not supported in ActionSet')
    }

    getActionAt(index: number): Action | undefined {
        if (index >= 0 && index < this.actions.length) {
            return this.actions[index]
        } else {
            return super.getActionAt(index)
        }
    }

    getActionCount(): number {
        return this.actions.length
    }

    getActionById(id: string): Action | undefined {
        let result: Action | undefined = undefined

        for (const item of this.actions) {
            result = item.getActionById(id)

            if (result) {
                break
            }
        }

        return result
    }

    /**
     * Create an instance of the ActionSet.
     * @summary Create an instance of the ActionSet and be able to pass actions in through an array, as well being
     * able to pass in the other properties.
     * @param props - The properties of the ActionSet and the additional actions array.
     * @return {ActionSet} An instance of {@link ActionSet}.
     */
    static fromWithActions<T extends ActionSet>(
        this: new () => T,
        props: Props<T> & { actions?: Action[] },
    ): T {
        const o = new this()
        const { actions, ...rest } = props
        Object.assign(o, rest)
        if (actions && actions.length > 0) {
            actions.forEach((action) => o.addAction(action))
        }
        return o
    }
}

@JsonObject()
export class Column extends Container {
    constructor(width?: ColumnWidth) {
        super()
        this.width = width
    }

    @JsonProperty({
        afterSerialize: function (width?: ColumnWidth): string | undefined {
            if (!width) return undefined
            if (width === 'auto' || width === 'stretch') {
                return width
            }

            const sizeAsString = width.physicalSize.toString()
            return width.unit === 'pixel' ? `${sizeAsString}px` : sizeAsString
        },
    })
    width?: ColumnWidth

    get horizontalAlignment(): HorizontalAlignment | undefined {
        return undefined
    }

    /**
     * This property is not supported in Column
     */
    set horizontalAlignment(_value: HorizontalAlignment | undefined) {
        throw new Error('horizontalAlignment is not supported in Column')
    }

    protected getJsonTypeName(): string {
        return 'Column'
    }
}

/**
 * ColumnSet divides a region into Columns, allowing elements to sit side-by-side.
 */
@JsonObject()
export class ColumnSet extends ContainerBase {
    @JsonProperty()
    private columns: Column[] = []

    /**
     * Add a {@link Column} to the ColumnSet.
     * @param column a valid {@link Column} item.
     */
    addColumn(column: Column): void {
        this.columns.push(column)
    }

    getItemAt(index: number): CardElement {
        return this.getColumnAt(index)
    }

    getColumnAt(index: number): Column {
        return this.columns[index]
    }

    getItemCount(): number {
        return this.columns.length
    }

    protected getJsonTypeName(): string {
        return 'ColumnSet'
    }

    getActionById(id: string): Action | undefined {
        let result: Action | undefined = undefined

        for (const column of this.columns) {
            result = column.getActionById(id)

            if (result) {
                break
            }
        }

        return result
    }

    /**
     * Create an instance of the ColumnSet.
     * @summary Create an instance of the ColumnSet and be able to pass columns in through an array, as well being
     * able to pass in the other properties.
     * @param props - The properties of the ColumnSet and the additional columns array.
     * @return {ColumnSet} An instance of {@link ColumnSet}.
     */
    static fromWithColumns<T extends ColumnSet>(
        this: new () => T,
        props: Props<T> & { columns?: Column[] },
    ): T {
        const o = new this()
        const { columns, ...rest } = props
        Object.assign(o, rest)
        if (columns && columns.length > 0) {
            columns.forEach((column) => o.addColumn(column))
        }
        return o
    }
}
