import { GlobalRegistry, TextColor, TextRun } from 'adaptivecards'

export class CustomTextRun extends TextRun {
    static readonly JsonTypeName = 'TextRun'

    protected internalRender(): HTMLElement | undefined {
        const html = super.internalRender()

        const anchors = html?.getElementsByClassName('ac-anchor')
        if (anchors && this.color) {
            for (const anchor of anchors) {
                anchor.classList.add(`ac-anchor__${TextColor[this.color].toLowerCase()}`)
            }
        }

        return html
    }
}

export function registerCardElements(): void {
    GlobalRegistry.elements.register(CustomTextRun.JsonTypeName, CustomTextRun)
}
