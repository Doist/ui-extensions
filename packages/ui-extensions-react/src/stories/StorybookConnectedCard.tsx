import { type ReactElement, useEffect, useState } from 'react'

import { AdaptiveCardRenderer } from '../components'
import { useAdaptiveCardsConnection } from '../hooks'

import type { DoistCardContext } from '@doist/ui-extensions-core'
import type { DoistCardConnectionParams } from '../hooks'
import type { DoistCardBridge, ExtensionError } from '../types'

const DEFAULT_CONTEXT: DoistCardContext = {
    user: {
        email: 'my@email.com',
        first_name: 'Mariko',
        id: 4,
        lang: 'jp',
        name: 'Mariko Uhehara',
        short_name: 'Mariko U.',
        timezone: 'Japan/Tokyo',
    },
    twist: {
        workspace: {
            id: 45646,
            name: 'Tokyo Labs',
        },
    },
    theme: 'light',
}

export type StorybookConnectedCardProps = {
    endpointUrl: string
    children?: (
        configuration: DoistCardConnectionParams,
        setConfiguration: (newConfig: DoistCardConnectionParams) => void,
    ) => ReactElement
}

export function StorybookConnectedCard(props: StorybookConnectedCardProps): ReactElement {
    const [bridgeActions, setBridgeActions] = useState<DoistCardBridge[]>([])
    const [configuration, setConfiguration] = useState<DoistCardConnectionParams>({
        context: DEFAULT_CONTEXT,
        bridgeActionCallbacks: {
            'composer.append': (x) => setBridgeActions([x, ...bridgeActions]),
        },
        endpointUrl: props.endpointUrl,
        onError: onError,
        token: '',
        version: 2,
    })

    const { onAction, result } = useAdaptiveCardsConnection(configuration)

    useEffect(() => {
        onAction({ actionType: 'initial' })
        // we _really_ want to only run this once on mount, we know what we're doing (🤞)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div style={{ marginTop: '4em', display: 'flex', flexDirection: 'row' }}>
            <AdaptiveCardRenderer
                onAction={onAction}
                onError={onError}
                result={result}
                errorText=""
                clipboardHandler={handleClipboard}
            />

            {props.children?.(configuration, setConfiguration)}
            <ul>
                {bridgeActions.map((x, i) => (
                    <li key={`${x.bridgeActionType}-${i}`}>{`type: ${x.bridgeActionType};`}</li>
                ))}
            </ul>
        </div>
    )
}

function onError(error: ExtensionError) {
    alert(error.error.message)
}

function handleClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
        () => alert(`Copied to clipboard: ${text}`),
        () =>
            alert(
                'Copying to clipboard failed. Maybe you haven\'t granted the "clipboard-write" permission?',
            ),
    )
}
