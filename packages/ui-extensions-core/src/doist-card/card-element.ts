import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { CardObject } from './card-object'

import type { Action } from './actions'
import type { ElementHeight, HorizontalAlignment, Spacing } from './types'

@Serializable()
export abstract class CardElement extends CardObject {
    @JsonProperty()
    separator?: boolean

    @JsonProperty()
    height?: ElementHeight

    @JsonProperty('horizontalAlignment')
    private _horizontalAlignment?: HorizontalAlignment | undefined

    public get horizontalAlignment(): HorizontalAlignment | undefined {
        return this._horizontalAlignment
    }

    public set horizontalAlignment(value: HorizontalAlignment | undefined) {
        this._horizontalAlignment = value
    }

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
