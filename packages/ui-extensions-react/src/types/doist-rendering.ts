import {
    Action,
    ActionProperty,
    AdaptiveCard,
    BoolProperty,
    Choice,
    ChoiceSetInput,
    Image,
    NumProperty,
    property,
    SerializableObjectCollectionProperty,
    StringProperty,
    TextInput,
    ToggleInput,
    Versions,
} from 'adaptivecards'

import type { Orientation } from '@doist/ui-extensions-core'

export type AdaptiveCardistVersion = '0.2' | '0.3' | '0.4'
export type InputStyle = 'text' | 'tel' | 'url' | 'email' | 'search'

export class AdaptiveCardistCard extends AdaptiveCard {
    static readonly adaptiveCardistVersionProperty = new StringProperty(
        Versions.v1_0,
        'adaptiveCardistVersion',
    )

    static readonly doistCardVersionProperty = new StringProperty(Versions.v1_0, 'doistCardVersion')

    static readonly autoFocusIdProperty = new StringProperty(Versions.v1_0, 'autoFocusId')

    @property(AdaptiveCardistCard.adaptiveCardistVersionProperty)
    adaptiveCardistVersion: AdaptiveCardistVersion = '0.3'

    @property(AdaptiveCardistCard.doistCardVersionProperty)
    doistCardVersion: AdaptiveCardistVersion = '0.3'

    @property(AdaptiveCardistCard.autoFocusIdProperty)
    autoFocusId?: string
}

export class TextInputist extends TextInput {
    static readonly JsonTypeName = 'Input.Text'
    static readonly rowsProperty = new NumProperty(Versions.v1_0, 'rows')
    static readonly inputStyleProperty = new StringProperty(Versions.v1_0, 'inputStyle')

    @property(TextInputist.rowsProperty)
    rows?: number

    @property(TextInputist.inputStyleProperty)
    inputStyle?: InputStyle

    getJsonTypeName(): string {
        return TextInputist.JsonTypeName
    }

    protected getSchemaKey(): string {
        return TextInputist.name
    }
}

export class Choiceist extends Choice {
    static readonly disabledProperty = new BoolProperty(Versions.v1_0, 'disabled')

    @property(Choiceist.disabledProperty)
    disabled?: boolean

    protected getSchemaKey(): string {
        return Choiceist.name
    }
}

export class ChoiceSetInputist extends ChoiceSetInput {
    static readonly JsonTypeName = 'Input.ChoiceSet'
    static readonly selectActionProperty = new ActionProperty(Versions.v1_1, 'selectAction')
    static readonly isSearchableProperty = new BoolProperty(Versions.v1_0, 'isSearchable')

    static readonly theChoicesProperty = new SerializableObjectCollectionProperty(
        Versions.v1_0,
        'choices',
        Choiceist,
    )

    static readonly orientationProperty = new StringProperty(Versions.v1_0, 'orientation')

    @property(ChoiceSetInputist.selectActionProperty)
    selectAction?: Action

    @property(ChoiceSetInputist.isSearchableProperty)
    isSearchable?: boolean

    @property(ChoiceSetInputist.theChoicesProperty)
    theChoices!: Choiceist[]

    @property(ChoiceSetInputist.orientationProperty)
    orientation?: Orientation

    getJsonTypeName(): string {
        return ChoiceSetInputist.JsonTypeName
    }

    protected getSchemaKey(): string {
        return ChoiceSetInputist.name
    }
}

export class ToggleInputist extends ToggleInput {
    static readonly JsonTypeName = 'Input.Toggle'
    static readonly selectActionProperty = new ActionProperty(Versions.v1_1, 'selectAction')

    @property(ToggleInputist.selectActionProperty)
    selectAction?: Action

    getJsonTypeName(): string {
        return ToggleInputist.JsonTypeName
    }

    protected getSchemaKey(): string {
        return ToggleInputist.name
    }
}

export class Imageist extends Image {
    static readonly JsonTypeName = 'Image'
    static readonly aspectRatioProperty = new NumProperty(Versions.v1_0, 'aspectRatio')

    @property(Imageist.aspectRatioProperty)
    aspectRatio?: number

    getJsonTypeName(): string {
        return Imageist.JsonTypeName
    }

    protected getSchemaKey(): string {
        return Imageist.name
    }
}
