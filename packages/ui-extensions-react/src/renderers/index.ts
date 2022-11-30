import { registerActions } from './action-renderers'
import { registerCardElements } from './card-element-renderers'
import { registerInput } from './input-renderers'

export function registerRenderers(): void {
    registerActions()
    registerCardElements()
    registerInput()
}
