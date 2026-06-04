import '@doist/reactist/styles/reactist.css'

import { TimePicker } from './time-picker'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof TimePicker> = {
    title: 'TimePicker',
    component: TimePicker,
    decorators: [
        (Story) => (
            <div style={{ maxWidth: '240px', padding: '24px' }}>
                <Story />
            </div>
        ),
    ],
}

// eslint-disable-next-line import/no-default-export
export default meta

type Story = StoryObj<typeof TimePicker>

export const Default: Story = {}

export const WithDefaultValue: Story = {
    args: { value: '13:15' },
}

export const ThirtyMinuteIntervalWithRange: Story = {
    args: { minutesInterval: 30, min: '09:00', max: '17:00' },
}
