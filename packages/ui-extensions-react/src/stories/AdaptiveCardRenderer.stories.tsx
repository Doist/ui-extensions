import { createRef } from 'react'

import { worker } from './mocks/browser'
import { StorybookConnectedCard } from './StorybookConnectedCard'

import type { ComponentMeta } from '@storybook/react'

// eslint-disable-next-line import/no-default-export
export default {
    title: 'AdaptiveCardRenderer',
    component: StorybookConnectedCard,
    decorators: [
        (Story) => {
            // Reset request handlers added in individual stories.
            if (worker) {
                worker.resetHandlers()
            }
            return <Story />
        },
    ],
} as ComponentMeta<typeof StorybookConnectedCard>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ErrorCard() {
    return <StorybookConnectedCard endpointUrl="/error-card/process" />
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ConnectedExtension() {
    return (
        <StorybookConnectedCard endpointUrl="https://twist-giphy.ngrok.io/process">
            {(configuration, setConfiguration) => {
                const inputRef = createRef<HTMLInputElement>()
                return (
                    <div
                        style={{
                            maxWidth: '350px',
                            marginLeft: '8em',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <h2>Configure URL</h2>
                        <div>
                            <p>
                                The card is connected to {configuration.endpointUrl}. You can change
                                the API endpoint here.{' '}
                            </p>
                            <p>
                                <b>IMPORTANT:</b> Please be aware that in order for this to work,
                                you would have to have temporarily disabled the twist verification
                                check on your locally running integration
                            </p>
                        </div>
                        <input ref={inputRef} defaultValue={configuration.endpointUrl} />
                        <button
                            type="button"
                            onClick={() =>
                                inputRef.current &&
                                setConfiguration({
                                    ...configuration,
                                    endpointUrl: inputRef.current.value,
                                })
                            }
                        >
                            Update URL
                        </button>
                    </div>
                )
            }}
        </StorybookConnectedCard>
    )
}
