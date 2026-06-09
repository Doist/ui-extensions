import { registerRenderedRoot, trackRootsDuringCardRender } from './rendered-roots'

import type { Root } from 'react-dom/client'

function mockRoot(): Root {
    return { render: jest.fn(), unmount: jest.fn() }
}

describe('rendered-roots', () => {
    it('collects the roots registered while the render runs', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation()
        const collected: Root[] = []
        const first = mockRoot()
        const second = mockRoot()

        trackRootsDuringCardRender(collected, () => {
            registerRenderedRoot(first)
            registerRenderedRoot(second)
        })

        expect(collected).toEqual([first, second])
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('does not attribute a root registered outside a render to the next render', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation()
        // A root registered outside a render, e.g. a clicked Action.ShowCard mounting an input.
        const orphan = mockRoot()
        registerRenderedRoot(orphan)

        // An unrelated render later tracks its own roots; the orphan must not leak in.
        const collected: Root[] = []
        trackRootsDuringCardRender(collected, () => {
            registerRenderedRoot(mockRoot())
        })

        expect(collected).not.toContain(orphan)
        expect(collected).toHaveLength(1)
        warn.mockRestore()
    })

    it('keeps roots registered before a throw and restores tracking afterwards', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation()
        const collected: Root[] = []
        const mountedBeforeThrow = mockRoot()

        // Even when render throws partway, roots already registered are still collected and
        // tracking is restored, so the next registration doesn't leak into this render.
        expect(() =>
            trackRootsDuringCardRender(collected, () => {
                registerRenderedRoot(mountedBeforeThrow)
                throw new Error('render blew up')
            }),
        ).toThrow('render blew up')

        expect(collected).toEqual([mountedBeforeThrow])

        registerRenderedRoot(mockRoot())
        expect(collected).toEqual([mountedBeforeThrow])
        expect(warn).toHaveBeenCalledTimes(1)

        warn.mockRestore()
    })
})
