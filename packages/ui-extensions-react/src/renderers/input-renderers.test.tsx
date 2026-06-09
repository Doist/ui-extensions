import { CustomNumberInput, CustomToggleInput } from './input-renderers'

describe('inputRenderers', () => {
    // Rendering an input alone (no AdaptiveCardRenderer) registers its root outside a render,
    // so the "root can't be tracked" dev-warning is expected here. Silence it, but assert in
    // afterEach that nothing else warned.
    let warnSpy: jest.SpyInstance

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    })

    afterEach(() => {
        const warnings = warnSpy.mock.calls.map(([message]) => String(message))
        jest.restoreAllMocks()
        for (const message of warnings) {
            expect(message).toMatch(
                /registerRenderedRoot called outside an AdaptiveCardRenderer render/,
            )
        }
    })

    describe('NumberInput', () => {
        it('displays correctly with no min/max set', () => {
            const numberInput = new CustomNumberInput()
            numberInput.id = '1'

            const html = numberInput.render() as HTMLElement
            const input = html.getElementsByClassName('ac-numberInput')[0] as HTMLInputElement

            expect(input).not.toBeUndefined()
            expect(input.id).toEqual('1')
            expect(input.max).toEqual('')
            expect(input.min).toEqual('')
        })

        it('displays correctly with min/max set', () => {
            const numberInput = new CustomNumberInput()
            numberInput.id = '1'
            numberInput.min = 1
            numberInput.max = 3

            const html = numberInput.render() as HTMLElement
            const input = html.getElementsByClassName('ac-numberInput')[0] as HTMLInputElement

            expect(input).not.toBeUndefined()
            expect(input.id).toEqual('1')
            expect(input.min).toEqual('1')
            expect(input.max).toEqual('3')
        })

        it('displays correctly with a defaultValue set', () => {
            const numberInput = new CustomNumberInput()
            numberInput.id = '1'
            numberInput.defaultValue = 3

            const html = numberInput.render() as HTMLElement
            const input = html.getElementsByClassName('ac-numberInput')[0] as HTMLInputElement

            expect(input).not.toBeUndefined()
            expect(input.id).toEqual('1')
            expect(input.defaultValue).toEqual('3')
        })
    })

    describe('ToggleInput', () => {
        it('renders an unchecked checkbox when set to false', () => {
            const toggleInput = new CustomToggleInput()
            toggleInput.id = '1'
            toggleInput.defaultValue = 'false'
            toggleInput.title = 'label'

            const html = toggleInput.render() as HTMLElement
            const input = html.getElementsByTagName('input')[0]

            expect(input).not.toBeUndefined()
            expect(input).not.toBeChecked()
        })

        it('renders a checked checkbox when set to true', () => {
            const toggleInput = new CustomToggleInput()
            toggleInput.id = '1'
            toggleInput.defaultValue = 'true'
            toggleInput.title = 'label'

            const html = toggleInput.render() as HTMLElement
            const input = html.getElementsByTagName('input')[0]

            expect(input).not.toBeUndefined()
            expect(input).toBeChecked()
        })
    })
})
