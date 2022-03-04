import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { Action } from './actions'
import { CardElement } from './card-element'
import { SerializableObject } from './serialization'

import type {
    ColumnWidth,
    ContainerStyle,
    HorizontalAlignment,
    ImageFillMode,
    Orientation,
    VerticalAlignment,
} from './types'

@Serializable()
export class BackgroundImage extends SerializableObject {
    @JsonProperty()
    url!: string

    @JsonProperty()
    fillMode?: ImageFillMode

    @JsonProperty()
    horizontalAlignment?: HorizontalAlignment

    @JsonProperty()
    verticalAlignment?: VerticalAlignment
}

@Serializable()
export abstract class ContainerBase extends CardElement {
    @JsonProperty()
    bleed?: boolean

    @JsonProperty({
        name: 'minHeight',
        afterSerialize: function (minHeight?: number): string | undefined {
            if (!minHeight) return undefined
            return `${minHeight}px`
        },
    })
    minHeight?: number

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

@Serializable()
export abstract class ContainerWithNoItems extends ContainerBase {
    @JsonProperty()
    verticalContentAlignment?: VerticalAlignment

    @JsonProperty('backgroundImage')
    private background?: BackgroundImage

    get backgroundImage(): BackgroundImage {
        if (!this.background) {
            this.background = new BackgroundImage()
        }

        return this.background
    }

    set backgroundImage(image: BackgroundImage) {
        this.background = image
    }

    @JsonProperty()
    style?: ContainerStyle

    @JsonProperty()
    selectAction?: Action
}

@Serializable()
export class Container extends ContainerWithNoItems {
    @JsonProperty('items')
    private items: CardElement[] = []

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
}

@Serializable()
export class ActionSet extends CardElement {
    @JsonProperty()
    private actions: Action[] = []

    @JsonProperty()
    orientation?: Orientation

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
}

@Serializable()
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

@Serializable()
export class ColumnSet extends ContainerBase {
    @JsonProperty()
    private columns: Column[] = []

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
}
