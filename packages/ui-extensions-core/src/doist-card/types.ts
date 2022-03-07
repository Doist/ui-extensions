import type { SizeAndUnit } from './shared'

export type DoistCardVersion = '0.3' | '0.4' | '0.5' | '0.6'
export type ElementHeight = 'auto' | 'stretch'

export type HorizontalAlignment = 'left' | 'center' | 'right'
export type VerticalAlignment = 'top' | 'center' | 'bottom'
export type Spacing = 'none' | 'small' | 'default' | 'medium' | 'large' | 'extraLarge'

export type ActionAlignment = 'left' | 'center' | 'right' | 'stretch'

export type ContainerStyle = 'default' | 'emphasis' | 'good' | 'attention' | 'warning' | 'accent'

export type ImageFillMode = 'cover' | 'repeatHorizontally' | 'repeatVertically' | 'repeat'

export type AssociatedInputs = 'auto' | 'none' | 'ignorevalidation'
export type ActionStyle = 'default' | 'positive' | 'destructive'

export type ColumnWidth = SizeAndUnit | 'auto' | 'stretch'

export type Orientation = 'horizontal' | 'vertical'

export type TextColor = 'default' | 'dark' | 'light' | 'accent' | 'good' | 'warning' | 'attention'
export type FontType = 'default' | 'monospace'
export type FontSize = 'default' | 'small' | 'medium' | 'large' | 'extraLarge'
export type FontWeight = 'default' | 'lighter' | 'bolder'
export type TextBlockStyle = 'default' | 'heading'

export type ImageSize = 'auto' | 'stretch' | 'small' | 'medium' | 'large'
export type ImageStyle = 'default' | 'person'
export type ImageHeight = 'auto' | string | number
export type ImageWidth = string | number

export type InputStyle = 'text' | 'tel' | 'url' | 'email' | 'search'

export type SizeUnit = 'weight' | 'pixel'

export type ChoiceSetInputStyle = 'compact' | 'expanded'

export type PropertyBag = { [propertyName: string]: unknown }
