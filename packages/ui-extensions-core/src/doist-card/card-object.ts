import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { SerializableObject } from './serialization'

/**
 * CardObject contains some of the common properties of all card objects.
 * @extends SerializableObject
 */
@Serializable()
export abstract class CardObject extends SerializableObject {
    constructor() {
        super()
        this.type = this.getJsonTypeName()
    }

    /**
     * The ID of the card object.
     */
    @JsonProperty()
    id?: string

    @JsonProperty()
    readonly type!: string

    protected getJsonTypeName(): string {
        throw new Error('no type set')
    }
}
