import type { SerializableObject } from './serialization'

// From https://stackoverflow.com/a/59272201
// This type will get all the properties of a type/class, but
// ignore any functions.
type ExcludeFunctionProps<T> = Omit<
    T,
    // eslint-disable-next-line @typescript-eslint/ban-types
    { [K in keyof T]-?: T[K] extends Function ? K : never }[keyof T]
>

// This is the type that we can pass into a constructor. We exclude the `type` property
// as this is not something that should (or can be) changed as it's a readonly property.
export type Props<T extends SerializableObject> = Omit<Partial<ExcludeFunctionProps<T>>, 'type'>
