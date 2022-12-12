import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { Action } from './actions'
import { CardElement } from './card-element'
import { SerializableObject } from './serialization'

import type { ChoiceSetInputStyle, InputStyle, Orientation } from './types'

/**
 * Base class for all inputs
 */
@Serializable()
export abstract class Input extends CardElement {
    /**
     * 	Label for this input
     */
    @JsonProperty()
    label?: string

    /**
     * 	Whether or not this input is required
     */
    @JsonProperty()
    isRequired?: boolean

    /**
     * 	Error message to display when entered input is invalid
     */
    @JsonProperty()
    errorMessage?: string
}

@Serializable()
export class TextInput extends Input {
    getJsonTypeName(): string {
        return 'Input.Text'
    }

    /**
     * The number of rows a multi-line text input should display. Default is 1.
     */
    @JsonProperty()
    rows?: number

    /**
     * Describes the style of the input.
     */
    @JsonProperty()
    inputStyle?: InputStyle

    /**
     * The default value for this input.
     */
    @JsonProperty('value')
    defaultValue?: string

    /**
     * Hint of maximum length characters to collect.
     */
    @JsonProperty()
    maxLength?: number

    /**
     * 	If `true`, allow multiple lines of input.
     */
    @JsonProperty()
    isMultiline?: boolean

    /**
     * Description of the input desired. Displayed when no text has been input.
     */
    @JsonProperty()
    placeholder?: string

    /**
     * An associated {@link Action}. The inline action for the input.
     * Typically displayed to the right of the input.
     */
    @JsonProperty()
    inlineAction?: Action

    /**
     * 	Regular expression indicating the required format of this text input.
     */
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
    /**
     * Hint of maximum value
     */
    @JsonProperty()
    max?: number

    /**
     * Hint of minimum value
     */
    @JsonProperty()
    min?: number

    /**
     * Description of the input desired. Displayed when no selection has been made.
     */
    @JsonProperty()
    placeholder?: string

    /**
     * 	Initial value for this field.
     */
    @JsonProperty('value')
    defaultValue?: number

    protected getJsonTypeName(): string {
        return 'Input.Number'
    }
}

@Serializable()
export class DateInput extends Input {
    /**
     * Hint of maximum value expressed in YYYY-MM-DD format.
     */
    @JsonProperty()
    max?: string

    /**
     * Hint of minimum value expressed in YYYY-MM-DD format.
     */
    @JsonProperty()
    min?: string

    /**
     * Description of the input desired. Displayed when no selection has been made.
     */
    @JsonProperty()
    placeholder?: string

    /**
     * 	The initial value for this field expressed in YYYY-MM-DD.
     */
    @JsonProperty('value')
    defaultValue?: string

    protected getJsonTypeName(): string {
        return 'Input.Date'
    }
}

@Serializable()
export class TimeInput extends Input {
    /**
     * 	Hint of maximum value expressed in HH:MM format.
     */
    @JsonProperty()
    max?: string

    /**
     *  Hint of minimum value expressed in HH:MM format.
     */
    @JsonProperty()
    min?: string

    /**
     *  Description of the input desired. Displayed when no selection has been made.
     */
    @JsonProperty()
    placeholder?: string

    /**
     *  The initial value for this field expressed in HH:MM.
     */
    @JsonProperty('value')
    defaultValue?: string

    protected getJsonTypeName(): string {
        return 'Input.Time'
    }
}

@Serializable()
export class ToggleInput extends Input {
    /**
     * Title for the toggle.
     */
    @JsonProperty()
    title!: string

    /**
     * The url of the icon to display alongside the title.
     */
    @JsonProperty()
    iconUrl?: string

    /**
     * The initial selected value.
     * If you want the toggle to be initially on, set this to the value to `"true"`.
     */
    @JsonProperty('value')
    defaultValue?: string

    /**
     * If true, allow text to wrap. Otherwise, text is clipped.
     */
    @JsonProperty()
    wrap?: boolean

    /**
     * An {@link Action} that will be invoked when the checked status is changed.
     */
    @JsonProperty()
    selectAction?: Action

    protected getJsonTypeName(): string {
        return 'Input.Toggle'
    }
}

@Serializable()
export class Choice extends SerializableObject {
    /**
     * Text to display.
     */
    @JsonProperty()
    title?: string

    /**
     * The raw value for the choice. NOTE: do not use a `,` in the value, since a {@link ChoiceSet}
     * with `isMultiSelect` set to `true` returns a comma-delimited string of choice values.
     */
    @JsonProperty()
    value?: string

    /**
     * If `true`, the option will render as disabled.
     */
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

    /**
     * Allow multiple choices to be selected.
     */
    @JsonProperty()
    isMultiSelect?: boolean

    /**
     * The initial choice (or set of choices) that should be selected.
     *
     * For multi-select, specify a comma-separated string of values.
     */
    @JsonProperty('value')
    defaultValue?: string

    /**
     * If true, allow text to wrap. Otherwise, text is clipped.
     */
    @JsonProperty()
    wrap?: boolean

    /**
     * Description of the input desired.
     *
     * Only visible when no selection has been made, the `style` is `compact` and `isMultiSelect` is `false`.
     */
    @JsonProperty()
    placeholder?: string

    /**
     * An {@link Action} that will be invoked when the selection is changed.
     */
    @JsonProperty()
    selectAction?: Action

    /**
     * Sets whether this list of choices is searchable and the text value can be free-form.
     */
    @JsonProperty()
    isSearchable?: boolean

    /**
     * Sets what style the ChoiceSet should use. Default is `compact`.
     */
    @JsonProperty()
    style?: ChoiceSetInputStyle

    /**
     * Sets what the orientation of the choices should be.
     *
     * Only applies if `style` is `expanded`. Default is `vertical`.
     */
    @JsonProperty()
    orientation?: Orientation

    protected getJsonTypeName(): string {
        return 'Input.ChoiceSet'
    }
}
