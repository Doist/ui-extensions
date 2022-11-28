import { serialize } from 'typescript-json-serializer'

import type { Props } from './props'

export class SerializableObject {
    toJSON(): string {
        return serialize(this, true) as string
    }

    /**
     * Easily create an instance of an object while passing in properties of the object.
     * @param this the type from which the object is created
     * @param props the props of the object to be created
     * @returns an instance of the type from which the object is created
     */
    static from<T extends SerializableObject>(this: new () => T, props: Props<T>): T {
        const o = new this()
        Object.assign(o, props)
        return o
    }
}
