import {
    BaseSerializationContext,
    CardElement,
    CustomProperty,
    Dictionary,
    GlobalRegistry,
    Input,
    property,
    PropertyBag,
    PropertyDefinition,
    SerializableObject,
    SubmitAction,
    Versions,
} from 'adaptivecards'

import type { AssociatedInputs } from '@doist/ui-extensions-core'

export class SubmitActionist extends SubmitAction {
    static readonly associatedInputProperty = new CustomProperty(
        Versions.v1_3,
        'associatedInputs',
        (
            _sender: SerializableObject,
            prop: PropertyDefinition,
            source: PropertyBag,
            _context: BaseSerializationContext,
        ) => {
            const value = source[prop.name] as string | undefined

            if (value !== undefined && typeof value === 'string') {
                return value.toLowerCase()
            }

            return undefined
        },
        (
            _sender: SerializableObject,
            prop: PropertyDefinition,
            target: PropertyBag,
            value: string | undefined,
            context: BaseSerializationContext,
        ) => {
            context.serializeValue(target, prop.name, value)
        },
    )

    @property(SubmitActionist.associatedInputProperty)
    associatedInput?: AssociatedInputs

    /**
     * This method is copied from the adaptivecards SDK verbatim with the exception
     * of the check for `associatedInput`.
     */
    protected internalGetReferencedInputs(): Dictionary<Input> {
        const result: Dictionary<Input> = {}

        // SJL: Important, we should use `associatedInput` and not the built-in
        // `associatedInputs` as that won't support our extended list of values.
        if (this.associatedInput !== 'none') {
            let current: CardElement | undefined = this.parent
            let inputs: Input[] = []

            while (current) {
                inputs = inputs.concat(current.getAllInputs(false))

                current = current.parent
            }

            for (const input of inputs) {
                if (input.id) {
                    result[input.id] = input
                }
            }
        }

        return result
    }

    protected internalValidateInputs(referencedInputs: Dictionary<Input> | undefined): Input[] {
        const result: Input[] = []

        if (referencedInputs) {
            for (const key of Object.keys(referencedInputs)) {
                const input = referencedInputs[key]

                if (this.associatedInput !== 'ignorevalidation' && !input.validateValue()) {
                    result.push(input)
                }
            }
        }

        return result
    }
}

GlobalRegistry.actions.register(SubmitActionist.JsonTypeName, SubmitActionist)
