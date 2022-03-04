import {
    Action,
    GlobalRegistry,
    property,
    SerializationContext,
    StringProperty,
    Strings,
    ValidationEvent,
    ValidationResults,
    Versions,
} from 'adaptivecards'

import type { ClipboardAction as ClipboardActionSource } from '@doist/ui-extensions-core'

export class ClipboardAction extends Action {
    static readonly JsonTypeName = 'Action.Clipboard'

    static readonly textProperty = new StringProperty(Versions.v1_0, 'text')

    @property(ClipboardAction.textProperty)
    text?: string

    getJsonTypeName(): string {
        return ClipboardAction.JsonTypeName
    }

    internalValidateProperties(context: ValidationResults) {
        super.internalValidateProperties(context)

        if (!this.text) {
            context.addFailure(
                this,
                ValidationEvent.PropertyCantBeNull,
                Strings.errors.propertyMustBeSet('text'),
            )
        }
    }

    parse(source: ClipboardActionSource, context?: SerializationContext) {
        super.parse(source, context)
        this.text = source.text
    }
}

GlobalRegistry.actions.register(ClipboardAction.JsonTypeName, ClipboardAction)
