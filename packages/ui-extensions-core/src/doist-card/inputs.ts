import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { Action } from './actions'
import { CardElement } from './card-element'
import { SerializableObject } from './serialization'

import type { ChoiceSetInputStyle, InputStyle, Orientation } from './types'

@Serializable()
export abstract class Input extends CardElement {
    @JsonProperty()
    label?: string

    @JsonProperty()
    isRequired?: boolean

    @JsonProperty()
    errorMessage?: string
}

@Serializable()
export class TextInput extends Input {
    getJsonTypeName(): string {
        return 'Input.Text'
    }

    @JsonProperty()
    rows?: number

    @JsonProperty()
    inputStyle?: InputStyle

    @JsonProperty('value')
    defaultValue?: string

    @JsonProperty()
    maxLength?: number

    @JsonProperty()
    isMultiline?: boolean

    @JsonProperty()
    placeholder?: string

    @JsonProperty()
    inlineAction?: Action

    @JsonProperty()
    regex?: string

    getActionById(id: string): Action | undefined {
        let result = super.getActionById(id)

        if (!result && this.inlineAction) {
            result = this.inlineAction.getActionById(id)
        }

        return result
    }
}

@Serializable()
export class NumberInput extends Input {
    @JsonProperty()
    max?: number

    @JsonProperty()
    min?: number

    @JsonProperty()
    placeholder?: string

    @JsonProperty('value')
    defaultValue?: number

    protected getJsonTypeName(): string {
        return 'Input.Number'
    }
}

@Serializable()
export class DateInput extends Input {
    @JsonProperty()
    max?: string

    @JsonProperty()
    min?: string

    @JsonProperty()
    placeholder?: string

    @JsonProperty('value')
    defaultValue?: string

    protected getJsonTypeName(): string {
        return 'Input.Date'
    }
}

@Serializable()
export class TimeInput extends Input {
    @JsonProperty()
    max?: string

    @JsonProperty()
    min?: string

    @JsonProperty()
    placeholder?: string

    @JsonProperty('value')
    defaultValue?: string

    protected getJsonTypeName(): string {
        return 'Input.Time'
    }
}

@Serializable()
export class ToggleInput extends Input {
    @JsonProperty()
    title!: string

    @JsonProperty('value')
    defaultValue?: string

    @JsonProperty()
    wrap?: boolean

    protected getJsonTypeName(): string {
        return 'Input.Toggle'
    }
}

@Serializable()
export class Choice extends SerializableObject {
    @JsonProperty()
    title?: string

    @JsonProperty()
    value?: string

    @JsonProperty()
    disabled?: boolean

    constructor(title?: string, value?: string, disabled?: boolean) {
        super()

        this.title = title
        this.value = value
        this.disabled = disabled
    }
}

@Serializable()
export class ChoiceSetInput extends Input {
    @JsonProperty()
    choices: Choice[] = []

    @JsonProperty()
    isMultiSelect?: boolean

    @JsonProperty('value')
    defaultValue?: string

    @JsonProperty()
    wrap?: boolean

    @JsonProperty()
    placeholder?: string

    @JsonProperty()
    selectAction?: Action

    @JsonProperty()
    isSearchable?: boolean

    @JsonProperty()
    style?: ChoiceSetInputStyle

    @JsonProperty()
    orientation?: Orientation

    protected getJsonTypeName(): string {
        return 'Input.ChoiceSet'
    }
}
