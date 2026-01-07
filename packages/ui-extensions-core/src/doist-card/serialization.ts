import { JsonSerializer } from 'typescript-json-serializer'

import type { Props } from './props'

const serializer = new JsonSerializer()

export class SerializableObject {
    toJSON(): object | null | undefined {
        return serializer.serializeObject(this)
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
