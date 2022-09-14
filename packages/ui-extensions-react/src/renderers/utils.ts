import { ActionStyle } from 'adaptivecards'

export function isPrimaryButton(style?: ActionStyle): boolean {
    return style === ActionStyle.Positive
}

export function isDefaultButton(style?: ActionStyle): boolean {
    return !style || style === ActionStyle.Default
}

export function isDangerButton(style?: ActionStyle): boolean {
    return style === ActionStyle.Destructive
}
