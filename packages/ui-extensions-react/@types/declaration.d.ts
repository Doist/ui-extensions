declare module '*.svg' {
    const content: JSX.Element
    // eslint-disable-next-line import/no-default-export
    export default content
}

declare module '*.css' {
    interface IClassNames {
        [className: string]: string
    }
    const classNames: IClassNames
    export = classNames
}
