import { JsonProperty, Serializable } from 'typescript-json-serializer'

import { CardObject } from './card-object'

import type { ActionStyle, AssociatedInputs, PropertyBag } from './types'

@Serializable()
export abstract class Action extends CardObject {
    @JsonProperty()
    title?: string

    @JsonProperty()
    iconUrl?: string

    @JsonProperty()
    style?: ActionStyle

    getActionById(id: string): Action | undefined {
        return this.id === id ? this : undefined
    }
}

@Serializable()
export class SubmitAction extends Action {
    @JsonProperty()
    associatedInputs?: AssociatedInputs

    @JsonProperty()
    data?: PropertyBag

    @JsonProperty()
    loadingText?: string

    protected getJsonTypeName(): string {
        return 'Action.Submit'
    }
}

@Serializable()
export class OpenUrlAction extends Action {
    @JsonProperty()
    url!: string

    protected getJsonTypeName(): string {
        return 'Action.OpenUrl'
    }
}

@Serializable()
export class ClipboardAction extends Action {
    @JsonProperty()
    text!: string

    protected getJsonTypeName(): string {
        return 'Action.Clipboard'
    }
}
