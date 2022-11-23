declare module '*.svg' {
    import { FC, ComponentProps } from 'react'

    const SVG: FC<ComponentProps<'svg'>>

    export = SVG
}
