import Select, { components } from 'react-select'

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <div className="bg-[#F2F4F7] h-6 w-6 cursor-pointer flex justify-center items-center rounded-[4px] mr-0.5">
      <img
        src="/svg/Dropdown.svg"
        width={11.5}
        height={6.8}
        alt="DownArrow"
        className={props.isFocused ? 'rotate-180 ' : ''}
      />
    </div>
  </components.DropdownIndicator>
)

const EmptyDropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <div className="h-6 w-6 cursor-pointer flex justify-center items-center rounded-[4px] mr-0.5">
      <img
        src="/svg/Dropdown.svg"
        width={11.5}
        height={6.8}
        alt="DownArrow"
        className={props.isFocused ? 'rotate-180 ' : ''}
      />
    </div>
  </components.DropdownIndicator>
)

const Dropdown = (props) => (
  <Select
    placeholder={props.placeholder}
    styles={{
      control: (baseStyles, state) => ({
        ...baseStyles,
        width: props.width || '400px',
        height: '48px',
        boxShadow: state.isFocused
          ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)'
          : '',
        '&:hover': {
          borderColor: '#F1F1EF !important'
        },
        border: '1px solid #F1F1EF',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        background: state.isSelected ? '#F1F1EF' : state.isFocused ? '#FBFAFA' : '',
        color: '#535251',
        fontSize: props.inputSize || '14px',
        fontFamily: 'Inter, sans-serif'
      }),
      menu: (baseStyles) => ({
        ...baseStyles,
        boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)',
        border: '1px solid #EAECF0',
        background: '#FFFFFF'
      })
    }}
    components={{ ...props.customComponents, DropdownIndicator }}
    className="basic-single"
    classNamePrefix="select"
    value={props.value}
    isSearchable
    name={props.name}
    options={props.options}
    onChange={props.handleOnChange}
    {...props}
  />
)

export const MiniDropDown = (props) => (
  <Select
    placeholder={props.placeholder}
    styles={{
      control: (baseStyles, state) => ({
        ...baseStyles,
        width: props.width || 'max-content',
        height: props.height || '32px',
        boxShadow: state.isFocused
          ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)'
          : '',
        '&:hover': {
          borderColor: '#F1F1EF !important'
        },
        border: '1px solid #F1F1EF',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        background: state.isSelected ? '#F1F1EF' : state.isFocused ? '#FBFAFA' : '',
        color: '#535251',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }),
      menu: (baseStyles) => ({
        ...baseStyles,
        boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)',
        border: '1px solid #EAECF0',
        background: '#FFFFFF',
        zIndex: 999
      })
    }}
    components={{ ...props.customComponents, DropdownIndicator, IndicatorSeparator: () => null }}
    className="basic-single"
    classNamePrefix="select"
    value={props.value}
    isSearchable
    name={props.name}
    options={props.options}
    onChange={props.handleOnChange}
    isDisabled={props.isDisabled}
    {...props}
  />
)

export const NoBorderDropdown = (props) => (
  <Select
    placeholder={props.placeholder}
    styles={{
      control: (baseStyles, state) => ({
        ...baseStyles,
        width: props.width || 'max-content',
        height: props.height || '32px',
        fontSize: '14px',
        border: 'none',
        boxShadow: state.isFocused
          ? '0px 4px 12px rgba(16, 24, 40, 0.04), 0px 0px 0px 4px rgba(241, 241, 239, 0.8)'
          : '',
        fontFamily: 'Inter, sans-serif'
      }),
      option: (baseStyles, state) => ({
        ...baseStyles,
        background: state.isSelected ? '#F1F1EF' : state.isFocused ? '#FBFAFA' : '',
        color: '#535251',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }),
      menu: (baseStyles) => ({
        ...baseStyles,
        boxShadow: '0px 4px 12px rgba(16, 24, 40, 0.02), 0px 4px 12px 4px rgba(16, 24, 40, 0.02)',
        border: '1px solid #EAECF0',
        background: '#FFFFFF',
        zIndex: 9999999
      })
    }}
    components={{ ...props.customComponents, EmptyDropdownIndicator, IndicatorSeparator: () => null }}
    className="basic-single"
    classNamePrefix="select"
    value={props.value}
    isSearchable
    name={props.name}
    options={props.options}
    onChange={props.handleOnChange}
    {...props}
  />
)

export default Dropdown
