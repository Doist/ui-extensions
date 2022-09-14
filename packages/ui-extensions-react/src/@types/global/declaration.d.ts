declare type ReactSVGComponent = React.ForwardRefExoticComponent<
    React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & React.RefAttributes<SVGSVGElement>
>
declare module '*.svg' {
    const ReactComponent: ReactSVGComponent
    // eslint-disable-next-line import/no-default-export
    export default ReactComponent
}

declare module '*.css' {
    interface IClassNames {
        [className: string]: string
    }
    const classNames: IClassNames
    export = classNames
}
