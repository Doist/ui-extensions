import { SubmitAction } from './actions'
import { ActionSet, Column, Container } from './containers'
import { SizeAndUnit } from './shared'

describe('containers', () => {
    describe('Column', () => {
        it('serialises the width when using SizeAndUnit with pixel', () => {
            const column = new Column(new SizeAndUnit(100, 'pixel'))

            expect(JSON.parse(JSON.stringify(column))).toMatchObject({
                type: 'Column',
                items: [],
                width: '100px',
            })
        })

        it('serialises the width when using SizeAndUnit with weight', () => {
            const column = new Column(new SizeAndUnit(100, 'weight'))

            expect(JSON.parse(JSON.stringify(column))).toMatchObject({
                type: 'Column',
                items: [],
                width: '100',
            })
        })

        it('does not include width if none provided', () => {
            const column = new Column()

            expect(JSON.parse(JSON.stringify(column))).toMatchObject({ type: 'Column', items: [] })
        })

        it('serialises the width when using auto', () => {
            const column = new Column('auto')

            expect(JSON.parse(JSON.stringify(column))).toMatchObject({
                type: 'Column',
                items: [],
                width: 'auto',
            })
        })

        it('serialises the width when using stretch', () => {
            const column = new Column('stretch')

            expect(JSON.parse(JSON.stringify(column))).toMatchObject({
                type: 'Column',
                items: [],
                width: 'stretch',
            })
        })
    })

    describe('container', () => {
        describe('getElementById', () => {
            it('returns a root level item', () => {
                const rootContainer = new Container()
                const subContainer = new Container()
                subContainer.id = 'TheId'

                rootContainer.addItem(subContainer)

                const result = rootContainer.getElementById('TheId')
                expect(result).not.toBeUndefined()
            })

            it('returns a sub level item', () => {
                const rootContainer = new Container()
                const subContainer = new Container()
                const subSubContainer = new Container()
                subSubContainer.id = 'TheId'

                subContainer.addItem(subSubContainer)
                rootContainer.addItem(subContainer)

                const result = rootContainer.getElementById('TheId')
                expect(result).not.toBeUndefined()
            })

            it('returns undefined if no item found', () => {
                const rootContainer = new Container()
                const subContainer = new Container()
                subContainer.id = 'TheId'

                rootContainer.addItem(subContainer)

                const result = rootContainer.getElementById('kwijibo')
                expect(result).toBeUndefined()
            })
        })

        describe('getActionById', () => {
            it('returns the correct action', () => {
                const container = new Container()
                const action = new SubmitAction()
                action.id = 'TheId'

                const actionSet = new ActionSet()
                actionSet.addAction(action)

                container.addItem(actionSet)

                const result = container.getActionById('TheId')
                expect(result).not.toBeUndefined()
            })
        })
    })
})
