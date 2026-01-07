import { JsonProperty, JsonObject } from 'typescript-json-serializer'

import { CardObject } from './card-object'

import type { ActionStyle, AssociatedInputs } from './types'
/**
 * The base Action class upon which all other Action types are derived.
 * @extends CardObject
 */
@JsonObject()
export abstract class Action extends CardObject {
    @JsonProperty()
    /**
     * The title of the action, what will be displayed on the button.
     */
    title?: string

    /**
     * The url of the icon to display on the button.
     */
    @JsonProperty()
    iconUrl?: string

    /**
     * The style of the action button.
     *
     * This can be `default`, `positive`, or `negative`.
     */
    @JsonProperty()
    style?: ActionStyle

    getActionById(id: string): Action | undefined {
        return this.id === id ? this : undefined
    }
}
/**
 * The SubmitAction is what is used to trigger an update from the extension server.
 * @extends Action
 */
@JsonObject()
export class SubmitAction extends Action {
    /**
     * Controls which inputs are associated with the submit action.
     *
     * Values for this can be `auto`, `none`, or `ignorevalidation`.
     *
     * - `auto` will only trigger the action if all required inputs have been filled out.
     * - `none` will always trigger, but none of the values from the inputs on the card will be sent.
     * - `ignorevalidation` will always trigger, and will send the values from the inputs on the card.
     */
    @JsonProperty()
    associatedInputs?: AssociatedInputs

    /**
     * Data that can be passed to the extension server in order for it to determine what to do next.
     */
    @JsonProperty()
    data?: Record<string, unknown>

    /**
     * Text to display whilst this submit action is taking place.
     */
    @JsonProperty()
    loadingText?: string

    protected getJsonTypeName(): string {
        return 'Action.Submit'
    }
}

/**
 * An Action that will open the provided URL in the user's browser.
 */
@JsonObject()
export class OpenUrlAction extends Action {
    /**
     * The URL to open.
     */
    @JsonProperty()
    url!: string

    protected getJsonTypeName(): string {
        return 'Action.OpenUrl'
    }
}

/**
 * An Action that, when triggered, will copy text to the user's clipboard.
 */
@JsonObject()
export class ClipboardAction extends Action {
    /**
     * The text to copy to the clipboard.
     */
    @JsonProperty()
    text!: string

    protected getJsonTypeName(): string {
        return 'Action.Clipboard'
    }
}
