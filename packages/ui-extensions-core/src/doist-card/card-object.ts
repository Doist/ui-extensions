import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { SerializableObject } from './serialization'

@Serializable()
export abstract class CardObject extends SerializableObject {
    constructor() {
        super()
        this.type = this.getJsonTypeName()
    }

    @JsonProperty()
    id?: string

    @JsonProperty()
    readonly type!: string

    protected getJsonTypeName(): string {
        throw new Error('no type set')
    }
}
