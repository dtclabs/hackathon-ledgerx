import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { components, IndicatorsContainerProps } from 'react-select'

const CustomIndicatorsContainer = (
  props: IndicatorsContainerProps<IFormatOptionLabel>,
  onClose: () => void,
  inputValue: string
) => (
  <components.IndicatorsContainer {...props}>
    {inputValue && (
      <button
        type="button"
        onClick={onClose}
        className="flex items-center justify-center rounded-full h-4 w-4 bg-gray-1200 mr-3"
      >
        <img src="/svg/CloseGray.svg" alt="close" height={10} width={10} />
      </button>
    )}
    {props.children}
  </components.IndicatorsContainer>
)

export default CustomIndicatorsContainer
