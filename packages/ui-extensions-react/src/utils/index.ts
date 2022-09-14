import type { ActionStyle } from '@doist/ui-extensions-core'

export function isPrimaryButton(style?: ActionStyle): boolean {
    return style === 'positive'
}

export function isDefaultButton(style?: ActionStyle): boolean {
    return !style || style === 'default'
}

export function isDangerButton(style?: ActionStyle): boolean {
    return style === 'destructive'
}

export type CanHaveAutoFocus = {
    shouldAutoFocus: boolean
}

export function canSetAutoFocus<T>(
    object: T | (T & CanHaveAutoFocus),
): object is T & CanHaveAutoFocus {
    return 'shouldAutoFocus' in object
}

export function createInputContainer(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'ac-input-container'
    return div
}
