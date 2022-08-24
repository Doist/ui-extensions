import React, { Suspense } from 'react'
import Select, {
    components,
    GroupBase,
    OnChangeValue,
    Props as SelectProps,
    StylesConfig,
} from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { Loading } from '@doist/reactist'

import type { CSSProperties } from 'react'
import type { InputProps } from 'react-select'

const basicCSSOverrides: CSSProperties = {
    background: 'inherit',
    borderColor: 'inherit',
    color: 'inherit',
}

// These styles are required to be set in order for the css values to be adhered to, otherwise
// it will try and use its base styles
const styles: StylesConfig<Option, boolean, GroupBase<Option>> = {
    control: (base) => ({
        ...base,
        ...basicCSSOverrides,
        boxShadow: 'inherit',
        ':hover': {
            borderColor: 'inherit',
        },
        ':focus': {
            borderColor: 'inherit',
        },
        display: 'flex',
    }),
    singleValue: (base) => ({
        ...base,
        ...basicCSSOverrides,
    }),
    input: () => ({
        ...basicCSSOverrides,
    }),
    menu: (base) => ({
        ...base,
        ...basicCSSOverrides,
        boxShadow: 'inherit',
    }),
    noOptionsMessage: (base) => ({
        ...base,
        textAlign: undefined,
    }),
    option: (base) => ({
        ...base,
        ...basicCSSOverrides,
        background: undefined,
        backgroundColor: undefined,
        ':active': {
            ...basicCSSOverrides,
        },
    }),
    // This hides the default separator
    indicatorSeparator: () => ({}),
    multiValue: (base) => ({
        ...base,
        border: undefined,
        borderColor: undefined,
        borderRadius: undefined,
        backgroundColor: undefined,
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: undefined,
    }),
    multiValueRemove: (base) => ({
        ...base,
        borderRadius: undefined,
        ':hover': {},
    }),
    valueContainer: (_base) => ({
        display: 'flex',
        marginLeft: '6px',
    }),
}

type SearchableSelectProps = SelectProps<Option, boolean> & {
    onValueChange?: (value: string) => void
    isSearchable?: boolean
}

type Option = { label: string; value: number }

function isOption(value: OnChangeValue<Option, boolean>): value is Option {
    return (value as Option).label !== undefined
}

function isMultipleOptions(value: OnChangeValue<Option, boolean>): value is Option[] {
    return (value as Option[]).length !== undefined
}

// This component is purely to get rid of the extra focus border that appears when
// a user starts typing.
function Input(props: InputProps<Option, boolean, GroupBase<Option>>): JSX.Element {
    return <components.Input {...props} data-no-keyboard-focus-marker />
}

/**
 * This component is a wrapper for the CreatableSelect so that some of its style values can
 * be force to inherit from the classnames that get passed in, this way it allows the
 * component to carry on using the standard twist styles set in the css.
 */
function SearchableSelect(props: SearchableSelectProps): JSX.Element {
    const { onValueChange, isSearchable } = props
    function onChange(value: OnChangeValue<Option, boolean>) {
        // Check to make sure it's a single option and not multiple options
        if (isOption(value)) {
            onValueChange?.(value.label)
        } else if (isMultipleOptions(value)) {
            onValueChange?.(value.map((x) => x.label).join(','))
        }
    }

    return (
        <Suspense fallback={<Loading aria-label="Loading" />}>
            {isSearchable ? (
                <CreatableSelect
                    {...props}
                    onChange={onChange}
                    styles={styles}
                    components={{
                        // This hides the dropdow button to make it look more like a textbox
                        DropdownIndicator: null,
                        Input,
                    }}
                />
            ) : (
                <Select
                    {...props}
                    onChange={onChange}
                    styles={styles}
                    components={{
                        // This hides the dropdow button to make it look more like a textbox
                        DropdownIndicator: null,
                        Input,
                    }}
                />
            )}
        </Suspense>
    )
}

export { SearchableSelect }
