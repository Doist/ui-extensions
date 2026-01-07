declare module '*.svg' {
    import { ComponentProps, FC } from 'react'

    const SVG: FC<ComponentProps<'svg'>>

    export = SVG
}
