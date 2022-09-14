import { CustomNumberInput, CustomToggleInput } from './input-renderers'

describe('inputRenderers', () => {
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
