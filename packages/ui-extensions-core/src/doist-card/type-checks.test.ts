import {
    ActionSet,
    CardElement,
    ChoiceSetInput,
    Column,
    ColumnSet,
    Container,
    DateInput,
    DoistCard,
    Image,
    NumberInput,
    RichTextBlock,
    TextBlock,
    TextInput,
    TextRun,
    TimeInput,
    ToggleInput,
} from '.'

describe('types checks', () => {
    test.each([
        [DoistCard, 'AdaptiveCard'],
        [Container, 'Container'],
        [ActionSet, 'ActionSet'],
        [Column, 'Column'],
        [ColumnSet, 'ColumnSet'],
        [TextBlock, 'TextBlock'],
        [Image, 'Image'],
        [TextRun, 'TextRun'],
        [RichTextBlock, 'RichTextBlock'],
        [TextInput, 'Input.Text'],
        [NumberInput, 'Input.Number'],
        [DateInput, 'Input.Date'],
        [TimeInput, 'Input.Time'],
        [ToggleInput, 'Input.Toggle'],
        [ChoiceSetInput, 'Input.ChoiceSet'],
    ])(
        'ensures type for %p is set correctly %p',
        // If you have unknown instead of any, then any class that has actual constructor params
        // fails to be recognised here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (element: { new (...args: any[]): unknown }, expectedType: string) => {
            const item = new element() as CardElement

            expect(item.type).toEqual(expectedType)
        },
    )
})
