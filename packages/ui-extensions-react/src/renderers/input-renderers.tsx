/* eslint-disable import/no-named-as-default-member */
import ReactDOM from 'react-dom'

import { CheckboxField, TextField } from '@doist/reactist'

import * as AC from 'adaptivecards'

// import { TimePicker } from '../components/time-picker'
import { TextInputist, ToggleInputist } from '../types/doist-rendering'
import { createInputContainer } from '../utils/renderer-utils'

import { createActionDiv } from './action-renderers'

import type { CanHaveAutoFocus } from '../utils/action-utils'

const ENTER_KEY_CODE = ['Enter', 'NumpadEnter']

// TODO: Investigate why having these renderers results in a render warning
// see https://twist.com/a/1585/ch/190200/t/2549303/
export class CustomTextInput extends TextInputist implements CanHaveAutoFocus {
    static readonly JsonTypeName = 'Input.Text'

    private _action: AC.Action | undefined

    shouldAutoFocus = false

    protected internalRender(): HTMLElement | undefined {
        const div = createInputContainer()
        const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
            // Enter pressed
            if (ENTER_KEY_CODE.includes(e.code) && this.inlineAction) {
                this.inlineAction.execute()
            }
        }

        const onTextAreaKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            // Enter pressed
            if (ENTER_KEY_CODE.includes(e.code) && this.inlineAction) {
                this.inlineAction.execute()
            }
        }

        if (this.isMultiline) {
            ReactDOM.render(
                // ref: https://github.com/Doist/Issues/issues/7406
                // Temporary fix: replace Rectist's TextArea with standard html textarea
                <textarea
                    data-testid={this.id}
                    id={this.id}
                    placeholder={this.placeholder}
                    defaultValue={this.defaultValue}
                    maxLength={this.maxLength}
                    onKeyPress={onTextAreaKeyPress}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore It should exist as `rows` is a valid property
                    rows={this.rows}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore It should exist as `className` is a valid property
                    className={this.hostConfig.makeCssClassName(
                        'ac-input',
                        'ac-textInput',
                        'ac-textarea',
                        'reactist_input', // Added to ensure the theming is correctly applied
                    )}
                    autoFocus={this.shouldAutoFocus}
                />,
                div,
            )
        } else {
            ReactDOM.render(
                <TextField
                    // label is an empty string here because the label is rendered by the Adaptive Card framework
                    label=""
                    data-testid={this.id}
                    id={this.id}
                    placeholder={this.placeholder}
                    defaultValue={this.defaultValue}
                    maxLength={this.maxLength}
                    onKeyPress={onKeyPress}
                    autoFocus={this.shouldAutoFocus}
                    enterKeyHint=""
                />,
                div,
            )
        }
        return div
    }

    protected overrideInternalRender(): HTMLElement {
        // Because we have to call overrideInternalRender on the super, this actually
        // ends up creating the inline action button, but without our customisations,
        // so we have to unset the inlineAction, call the render, then set the inlineAction
        // again.
        this._action = this.inlineAction
        this.inlineAction = undefined
        const renderedInputControl = super.overrideInternalRender() as HTMLElement
        this.inlineAction = this._action

        if (this.inlineAction) {
            const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.preventDefault()
                this.inlineAction?.execute()
            }

            const button = createActionDiv({
                title: this.inlineAction.title ?? '',
                style: this.inlineAction.style,
                baseCssClass: 'input-inline-button',
                id: this.inlineAction.id,
                onClick,
                actionAlignment: this.hostConfig.actions.actionAlignment,
                isInputButton: true,
            })

            this.inputControlContainerElement.appendChild(button)
        }

        return renderedInputControl
    }

    isValid(): boolean {
        if (!this.value) {
            return true
        }

        if (this.regex) {
            return new RegExp(this.regex, 'g').test(this.value)
        }

        return true
    }

    get value(): string | undefined {
        if (this.renderedInputControlElement?.hasChildNodes()) {
            if (this.isMultiline) {
                const textArea =
                    this.renderedInputControlElement.getElementsByTagName('textarea')[0]
                return textArea.value
            } else {
                const input = this.renderedInputControlElement.getElementsByTagName('input')[0]
                return input.value
            }
        } else {
            return undefined
        }
    }
}

// export class CustomTimeInput extends AC.TimeInput {
//     static readonly JsonTypeName = 'Input.Time'

//     protected internalRender(): HTMLElement | undefined {
//         const div = createInputContainer()

//         ReactDOM.render(
//             <TimePicker
//                 data-testid={this.id}
//                 min={this.min}
//                 max={this.max}
//                 value={this.defaultValue}
//                 className={this.hostConfig.makeCssClassName('ac-input', 'ac-timeInput')}
//                 minutesInterval={15}
//             />,
//             div,
//         )

//         return div
//     }

//     get value(): string | undefined {
//         const select = this.renderedInputControlElement?.querySelector(
//             'select',
//         ) as HTMLSelectElement
//         return select.value
//     }
// }

export class CustomNumberInput extends AC.NumberInput implements CanHaveAutoFocus {
    static readonly JsonTypeName = 'Input.Number'

    shouldAutoFocus = false

    protected internalRender(): HTMLElement | undefined {
        const div = createInputContainer()

        ReactDOM.render(
            <TextField
                data-testid={this.id}
                // label is an empty string here because the label is rendered by the Adaptive Card framework
                label=""
                id={this.id}
                // @ts-expect-error Until Reactist comes up with a way to deal with number input we need to force the type on the TextField.
                type="number"
                placeholder={this.placeholder}
                min={this.min}
                max={this.max}
                defaultValue={this.defaultValue}
                className={this.hostConfig.makeCssClassName('ac-input', 'ac-numberInput')}
                autoFocus={this.shouldAutoFocus}
            />,
            div,
        )

        return div
    }

    get value(): number | undefined {
        const input = this.renderedInputControlElement?.childNodes[0] as
            | HTMLInputElement
            | undefined
        return input ? parseInt(input.value) : undefined
    }
}

export class CustomToggleInput extends ToggleInputist {
    static readonly JsonTypeName = 'Input.Toggle'

    private valueInternal?: boolean

    private onChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.valueInternal = e.target.checked
        this.selectAction?.execute()
    }

    protected internalRender(): HTMLElement | undefined {
        const div = createInputContainer()

        this.valueInternal = this.defaultValue?.toLowerCase() === 'true'

        ReactDOM.render(
            <CheckboxField
                label={this.title}
                defaultChecked={this.valueInternal}
                onChange={(event) => this.onChange(event)}
                enterKeyHint="enter"
            />,
            div,
        )

        return div
    }

    get value(): string | undefined {
        return String(this.valueInternal)
    }
}

export function registerInput(): void {
    AC.GlobalRegistry.elements.register(CustomTextInput.JsonTypeName, CustomTextInput)
    // AC.GlobalRegistry.elements.register(CustomTimeInput.JsonTypeName, CustomTimeInput)
    AC.GlobalRegistry.elements.register(CustomNumberInput.JsonTypeName, CustomNumberInput)
    AC.GlobalRegistry.elements.register(CustomToggleInput.JsonTypeName, CustomToggleInput)
}
