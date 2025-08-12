import type { ActionStyle } from 'adaptivecards'

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

export function canSetAutoFocus<T extends object>(
    object: T | (T & CanHaveAutoFocus),
): object is T & CanHaveAutoFocus {
    return 'shouldAutoFocus' in object
}
