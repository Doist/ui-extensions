import { type ReactElement, Suspense } from 'react'
import Select, { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'

import { Loading } from '@doist/reactist'

import type {
    CSSObjectWithLabel,
    GroupBase,
    InputProps,
    OnChangeValue,
    Props as SelectProps,
    StylesConfig,
} from 'react-select'

type Option = { label: string; value: number }

const basicCSSOverrides = {
    background: 'inherit' as const,
    borderColor: 'inherit' as const,
    color: 'inherit' as const,
}

// These styles are required to be set in order for the css values to be adhered to, otherwise
// it will try and use its base styles
const styles: StylesConfig<Option, boolean, GroupBase<Option>> = {
    control: (base, _props) =>
        ({
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
        }) as CSSObjectWithLabel,
    singleValue: (base, _props) =>
        ({
            ...base,
            ...basicCSSOverrides,
        }) as CSSObjectWithLabel,
    input: (_base, _props) =>
        ({
            ...basicCSSOverrides,
        }) as CSSObjectWithLabel,
    menu: (base, _props) =>
        ({
            ...base,
            ...basicCSSOverrides,
            boxShadow: 'inherit',
        }) as CSSObjectWithLabel,
    noOptionsMessage: (base, _props) =>
        ({
            ...base,
            textAlign: undefined,
        }) as CSSObjectWithLabel,
    option: (base, _props) =>
        ({
            ...base,
            ...basicCSSOverrides,
            background: undefined,
            backgroundColor: undefined,
            ':active': {
                ...basicCSSOverrides,
            },
        }) as CSSObjectWithLabel,
    // This hides the default separator
    indicatorSeparator: (_base, _props) => ({}) as CSSObjectWithLabel,
    multiValue: (base, _props) =>
        ({
            ...base,
            border: undefined,
            borderColor: undefined,
            borderRadius: undefined,
            backgroundColor: undefined,
        }) as CSSObjectWithLabel,
    multiValueLabel: (base, _props) =>
        ({
            ...base,
            color: undefined,
        }) as CSSObjectWithLabel,
    multiValueRemove: (base, _props) =>
        ({
            ...base,
            borderRadius: undefined,
            ':hover': {},
        }) as CSSObjectWithLabel,
    valueContainer: (_base, _props) =>
        ({
            display: 'flex',
            marginLeft: '6px',
        }) as CSSObjectWithLabel,
}

type SearchableSelectProps = SelectProps<Option, boolean> & {
    onValueChange?: (value: string) => void
    isSearchable?: boolean
}

function isOption(value: OnChangeValue<Option, boolean>): value is Option {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (value as Option).label !== undefined
}

function isMultipleOptions(value: OnChangeValue<Option, boolean>): value is Option[] {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (value as Option[]).length !== undefined
}

// This component is purely to get rid of the extra focus border that appears when
// a user starts typing.
function Input(props: InputProps<Option, boolean, GroupBase<Option>>) {
    // @ts-expect-error - react-select's Element type is not compatible with React 19's stricter JSX types
    return <components.Input {...props} data-no-keyboard-focus-marker />
}

/**
 * This component is a wrapper for the CreatableSelect so that some of its style values can
 * be force to inherit from the classnames that get passed in, this way it allows the
 * component to carry on using the standard twist styles set in the css.
 */
function SearchableSelect(props: SearchableSelectProps): ReactElement {
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
