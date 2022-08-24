import React from 'react'

import { render, screen } from '@testing-library/react'

import { TimePicker } from './time-picker'

describe('TimePicker', () => {
    function onTimeChanged() {
        // Empty as just a placeholder
    }

    const mockedWarn = jest.spyOn(console, 'warn').mockImplementation()
    beforeEach(() => {
        mockedWarn.mockClear()
    })

    describe('no min/max entered', () => {
        it('displays the correct time ranges with default time span', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(289)
            expect(options[0].text).toEqual('--:--')
            expect(options[0].value).toEqual('')
        })

        it('displays the correct time ranges with 5 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={5} />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(289)
            expect(options[1].value).toEqual('00:00')
            expect(options[2].value).toEqual('00:05')
        })

        it('displays the correct time ranges with 30 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={30} />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(49)
            expect(options[1].value).toEqual('00:00')
            expect(options[2].value).toEqual('00:30')
        })

        it('displays the correct time ranges with 29 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={29} />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(51)
            expect(options[1].value).toEqual('00:00')
            expect(options[2].value).toEqual('00:29')
            expect(options[3].value).toEqual('00:58')
            expect(options[4].value).toEqual('01:27')
        })
    })

    describe('min time entered', () => {
        it('displays the correct time ranges with 5 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={5} min="13:00" />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(133)
            expect(options[1].value).toEqual('13:00')
            expect(options[2].value).toEqual('13:05')
        })

        it('displays the correct time ranges with 30 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={30} min="13:00" />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(23)
            expect(options[1].value).toEqual('13:00')
            expect(options[2].value).toEqual('13:30')
        })
    })

    describe('max time entered', () => {
        it('displays the correct time ranges with 5 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={5} max="13:31" />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(164)
            expect(options[1].value).toEqual('00:00')
            expect(options.slice(-1)[0].value).toEqual('13:30')
        })

        it('displays the correct time ranges with 30 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={30} max="13:31" />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(29)
            expect(options[1].value).toEqual('00:00')
            expect(options.slice(-1)[0].value).toEqual('13:30')
        })

        it('displays the correct time ranges with 29 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={29} max="13:31" />)

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(29)
            expect(options[1].value).toEqual('00:00')
            expect(options.slice(-1)[0].value).toEqual('13:03')
        })
    })

    describe('defaultValue used', () => {
        it('gives the correct value with 5 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={5} value="13:12" />)

            const select = screen.getByRole<HTMLSelectElement>('combobox')

            expect(select.value).toEqual('13:15')
        })

        it('gives the correct value with 30 minute intervals', () => {
            render(<TimePicker onTimeChanged={onTimeChanged} minutesInterval={30} value="13:12" />)

            const select = screen.getByRole<HTMLSelectElement>('combobox')

            expect(select.value).toEqual('13:30')
        })
    })

    describe('unhappy paths', () => {
        test('max < min results in no min/max set and a console warning', () => {
            render(
                <TimePicker
                    onTimeChanged={onTimeChanged}
                    minutesInterval={30}
                    max="13:30"
                    min="13:31"
                />,
            )

            const options = screen.getAllByRole<HTMLOptionElement>('option')

            expect(options).toHaveLength(49)
            expect(mockedWarn).toHaveBeenCalledWith('max Time cannot be less than min time')
        })
    })
})
