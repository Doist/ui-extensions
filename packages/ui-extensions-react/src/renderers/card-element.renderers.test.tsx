import { SubmitAction, TextColor } from 'adaptivecards'

import { CustomTextRun } from './card-element-renderers'

describe('card element renderers', () => {
    describe('CustomTextRun', () => {
        it('adds a new class with the text color if an anchor is present', () => {
            const textRun = new CustomTextRun()
            textRun.text = 'kwijibo'
            textRun.color = TextColor.Attention
            textRun.selectAction = new SubmitAction()

            const html = textRun.render() as HTMLElement

            const anchor = html.getElementsByTagName('a')[0]

            expect(anchor).toHaveClass('ac-anchor__attention')
        })
    })
})
