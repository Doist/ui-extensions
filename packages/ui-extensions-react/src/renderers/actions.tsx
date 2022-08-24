import React from 'react'
import ReactDOM from 'react-dom'

import { Button, ButtonProps, DeprecatedButton } from '@doist/reactist'

import { ActionAlignment, ActionStyle, GlobalRegistry, OpenUrlAction } from 'adaptivecards'
import classNames from 'classnames'

import { ClipboardAction, SubmitActionist } from '../actions'

import { isDangerButton, isPrimaryButton } from './utils'

import type { CSSProperties } from 'react'

type ActionProps = {
    title: string
    style: ActionStyle
    baseCssClass?: string
    id?: string
    onClick?: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined
    isLink?: boolean
    actionAlignment: ActionAlignment
    isInputButton?: boolean
}

function getNewButtonProps(style?: ActionStyle): Pick<ButtonProps, 'variant' | 'tone'> {
    if (isDangerButton(style)) {
        return { variant: 'primary', tone: 'destructive' }
    }
    return { variant: isPrimaryButton(style) ? 'primary' : 'secondary' }
}

export function createActionDiv({
    title,
    style,
    baseCssClass,
    id,
    onClick,
    isLink,
    actionAlignment,
    isInputButton,
}: ActionProps): HTMLDivElement {
    const div = document.createElement('div')
    if (isInputButton) {
        div.style.paddingLeft = '6px'
    }

    const linkStyle: CSSProperties = {
        marginTop: '6px',
    }

    // eslint-disable-next-line import/no-named-as-default-member
    ReactDOM.render(
        isLink ? (
            <DeprecatedButton
                id={id}
                onClick={onClick}
                className={classNames(baseCssClass, {
                    'ac-action-stretch': actionAlignment === ActionAlignment.Stretch,
                })}
                variant="link"
                style={linkStyle}
            >
                {title}
            </DeprecatedButton>
        ) : (
            <Button
                {...getNewButtonProps(style)}
                id={id}
                onClick={onClick}
                exceptionallySetClassName={classNames(baseCssClass, {
                    'ac-action-stretch': actionAlignment === ActionAlignment.Stretch,
                })}
            >
                {title}
            </Button>
        ),
        div,
    )
    return div
}

export class SubmitActionTwist extends SubmitActionist {
    private internalRenderedElement: HTMLElement | undefined

    get renderedElement(): HTMLElement | undefined {
        return this.internalRenderedElement
    }

    render(baseCssClass?: string): void {
        const div = createActionDiv({
            title: this.title ?? '',
            style: this.style,
            baseCssClass,
            id: this.id,
            actionAlignment: this.hostConfig.actions.actionAlignment,
        })
        this.internalRenderedElement = div
    }
}

export class OpenUrlActionTwist extends OpenUrlAction {
    private internalRenderedElement: HTMLElement | undefined

    get renderedElement(): HTMLElement | undefined {
        return this.internalRenderedElement
    }

    render(baseCssClass?: string): void {
        const div = createActionDiv({
            title: this.title ?? '',
            style: this.style,
            baseCssClass,
            id: this.id,
            actionAlignment: this.hostConfig.actions.actionAlignment,
        })
        this.internalRenderedElement = div
    }
}

export class ClipboardActionTwist extends ClipboardAction {
    private internalRenderedElement: HTMLElement | undefined

    get renderedElement(): HTMLElement | undefined {
        return this.internalRenderedElement
    }

    render(baseCssClass?: string): void {
        const div = createActionDiv({
            title: this.title ?? '',
            style: this.style,
            baseCssClass,
            id: this.id,
            actionAlignment: this.hostConfig.actions.actionAlignment,
        })
        this.internalRenderedElement = div
    }
}

export function registerActions(): void {
    GlobalRegistry.actions.register(SubmitActionTwist.JsonTypeName, SubmitActionTwist)
    GlobalRegistry.actions.register(OpenUrlActionTwist.JsonTypeName, OpenUrlActionTwist)
    GlobalRegistry.actions.register(ClipboardActionTwist.JsonTypeName, ClipboardActionTwist)
}
