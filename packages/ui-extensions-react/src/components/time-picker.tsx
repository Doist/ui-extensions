import React, { useCallback, useMemo } from 'react'

import { DeprecatedSelect } from '@doist/reactist'

import classNames from 'classnames'
import dayjs, { Dayjs } from 'dayjs'
import CustomParseFormat from 'dayjs/plugin/customParseFormat'

import ClockIcon from '../icons/clock.svg'

import * as styles from './time-picker.module.css'

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(CustomParseFormat)

const MINUTES_INTERVAL = 5

type TimePickerProps = {
    minutesInterval?: number
    onTimeChanged?: (value: string) => void
    min?: string
    max?: string
    value?: string
    className?: string
}

export function TimePicker({
    minutesInterval = MINUTES_INTERVAL,
    onTimeChanged,
    min,
    max,
    value,
    className,
}: TimePickerProps): JSX.Element {
    const times = useMemo(() => getTimes(min, max, minutesInterval), [min, max, minutesInterval])
    const defaultValue = useMemo(() => roundTime(minutesInterval, value), [minutesInterval, value])

    const timeChanged = useCallback(
        (time: string) => {
            if (onTimeChanged) {
                onTimeChanged(time)
            }
        },
        [onTimeChanged],
    )

    return (
        <div className={classNames(styles.time_picker, className)}>
            <div data-testid="time-picker" className={classNames(styles.time_picker, className)}>
                <DeprecatedSelect
                    onChange={(time) => timeChanged(time)}
                    defaultValue={defaultValue}
                    options={times}
                />
            </div>
            <ClockIcon className={classNames(styles.time_picker, styles.svg_icon)} />
        </div>
    )
}

function roundTime(minutesInterval: number, value?: string): string {
    const time = breakUpTime(value)
    if (!time) return ''

    const date = time.toDate()
    const coeff = 1000 * 60 * minutesInterval
    const rounded = dayjs(Math.ceil(date.getTime() / coeff) * coeff)
    return rounded.format('HH:mm')
}

function getTimes(min: string | undefined, max: string | undefined, minutesInterval: number) {
    const times = [
        {
            value: '',
            text: '--:--',
        },
    ]

    let minTime = breakUpTime(min)
    let maxTime = breakUpTime(max)

    if (minTime && maxTime && maxTime < minTime) {
        minTime = maxTime = undefined
        // eslint-disable-next-line no-console
        console.warn('max Time cannot be less than min time')
    }

    let rollingDate: Dayjs = minTime ?? dayjs('00:00', 'HH:mm')
    const endDate = maxTime ?? dayjs().startOf('day').add(1, 'day')

    while (rollingDate < endDate) {
        const value = `${zeroPad(rollingDate.hour())}:${zeroPad(rollingDate.minute())}`
        times.push({ value: value, text: value })

        rollingDate = rollingDate.add(minutesInterval, 'minute')
    }

    return times
}

function zeroPad(i: number): string {
    return `0${i}`.substr(-2)
}

function breakUpTime(value?: string): Dayjs | undefined {
    return value ? dayjs(value, 'HH:mm') : undefined
}
