import type { SizeUnit } from './types'

export class SizeAndUnit {
    physicalSize: number
    unit: SizeUnit

    static parse(input: string, requireUnitSpecifier = false): SizeAndUnit {
        const result = new SizeAndUnit(0, 'weight')

        if (typeof input === 'number') {
            result.physicalSize = input

            return result
        } else if (typeof input === 'string') {
            const regExp = /^([0-9]+)(px|\*)?$/g
            const matches = regExp.exec(input)
            const expectedMatchCount = requireUnitSpecifier ? 3 : 2

            if (matches && matches.length >= expectedMatchCount) {
                result.physicalSize = parseInt(matches[1])

                if (matches.length === 3) {
                    if (matches[2] === 'px') {
                        result.unit = 'pixel'
                    }
                }

                return result
            }
        }

        throw new Error('Invalid size: ' + input)
    }

    constructor(physicalSize: number, unit: SizeUnit) {
        this.physicalSize = physicalSize
        this.unit = unit
    }
}
