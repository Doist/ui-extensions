import { JsonProperty, JsonObject } from 'typescript-json-serializer'

import { CardObject } from './card-object'

import type { Action } from './actions'
import type { ElementHeight, HorizontalAlignment, Spacing } from './types'
/**
 * The base CardElement upon which all other card elements are derived.
 * @extends CardObject
 */
@JsonObject()
export abstract class CardElement extends CardObject {
    /**
     * Whether this element should have a separator bar above it.
     */
    @JsonProperty()
    separator?: boolean

    /**
     * The height of the element.
     */
    @JsonProperty()
    height?: ElementHeight

    @JsonProperty('horizontalAlignment')
    private _horizontalAlignment?: HorizontalAlignment | undefined

    /**
     * The horizontal alignment of the element.
     */
    public get horizontalAlignment(): HorizontalAlignment | undefined {
        return this._horizontalAlignment
    }

    public set horizontalAlignment(value: HorizontalAlignment | undefined) {
        this._horizontalAlignment = value
    }

    /**
     * The spacing between this element and the previous element.
     */
    @JsonProperty()
    spacing?: Spacing

    getElementById(id: string): CardElement | undefined {
        return this.id === id ? this : undefined
    }

    getActionById(_id: string): Action | undefined {
        return undefined
    }

    getActionAt(_index: number): Action | undefined {
        throw new Error('Index out of range')
    }
}
