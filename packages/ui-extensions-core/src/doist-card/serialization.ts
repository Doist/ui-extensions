import { serialize } from 'typescript-json-serializer'

import type { Props } from './props'

export class SerializableObject {
    toJSON(): string {
        return serialize(this, true) as string
    }

    static from<T extends SerializableObject>(this: new () => T, props: Props<T>): T {
        const o = new this()
        Object.assign(o, props)
        return o
    }
}
