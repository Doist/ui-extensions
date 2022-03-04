import * as React from 'react'

import classNames from 'classnames'

type AdaptiveCardProps = {
    card?: HTMLElement
}

export function AdaptiveCardCanvas({ card }: AdaptiveCardProps): JSX.Element {
    const cardElementRootRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(
        function renderAdaptiveCardContent() {
            const rootElement = cardElementRootRef.current
            if (!card || !rootElement) return
            Array.from(rootElement.children).forEach((child) => {
                rootElement.removeChild(child)
            })

            rootElement.appendChild(card)
        },
        [card],
    )

    return <div ref={cardElementRootRef} className={classNames('adaptive-card-content')} />
}
