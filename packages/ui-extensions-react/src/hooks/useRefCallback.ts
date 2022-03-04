// Adapted from: https://github.com/mui-org/material-ui/blob/master/packages/material-ui/src/utils/useEventCallback.js

import * as React from 'react'

/**
 * Since useCallback is called too often in practice we use this workaround proposed by the react
 * core team: https://github.com/facebook/react/issues/14099#issuecomment-440013892
 */
export function useRefCallback<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
    const ref = React.useRef(fn)
    React.useLayoutEffect(() => {
        ref.current = fn
    })
    return React.useCallback((...args: A) => ref.current(...args), [])
}
