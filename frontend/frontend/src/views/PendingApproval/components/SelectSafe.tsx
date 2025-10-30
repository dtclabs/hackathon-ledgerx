import { FC, useMemo } from 'react'
import { customStyles } from '@/constants/styles'
import { formatNumber } from '@/utils/formatNumber'

import CustomMenuList from '@/components/SelectItem/MenuList'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import { components, IndicatorsContainerProps } from 'react-select'
import FormatOptionLabel, { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { useSelectAvailableSource } from '@/hooks-v2/make-payments/useSelectAvailableSource'

import useSelectBlockchainIcon from '@/hooks-v2/cryptocurrency/useSelectBlockchainIcon'

interface ISourceWallet {
  selectedChain: any
  isLoading?: boolean
  onSelectSafe?: (value: any) => void
  selectedSafe?: any
}
const customOptionLabel = (props) => <FormatOptionLabel {...props} />

const SourceWallet: FC<ISourceWallet> = ({ selectedChain, isLoading, onSelectSafe, selectedSafe }) => {
  const { sources } = useSelectAvailableSource()
  const { findBlockchainIcon } = useSelectBlockchainIcon()

  const parseOptionData = useMemo(() => {
    const result = []

    if (sources?.length > 0) {
      sources.forEach((item) => {
        if (item?.sourceType === 'gnosis') {
          // @ts-ignore
          const chainImage = findBlockchainIcon(item?.supportedBlockchains[0])

          result.push({
            id: item.id,
            value: item.address,
            label: item.name,
            address: item.address,
            tokenImage: chainImage ?? '/svg/ETH.svg',
            // @ts-ignore
            totalPrice: formatNumber(item?.chainBalance, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            }),
            sourceId: item.id,
            ...item
          })
        }
      })
    }
    return result
  }, [sources, selectedChain])

  const handleOnChange = (_value) => onSelectSafe(_value)

  const handleClose = () => onSelectSafe(null)

  const handleEmptySource = () =>
    isLoading ? (
      <div className="flex gap-6 my-6 items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
      </div>
    ) : (
      <div>No safe found on this chain.</div>
    )

  return (
    <SelectItem
      disabled={isLoading}
      name="source-safe"
      options={parseOptionData}
      placeholder="Select a safe"
      customStyles={{ ...customStyles, menu: (baseStyles) => ({ ...baseStyles, zIndex: 9999 }) }}
      isClearable
      formatOptionLabel={customOptionLabel}
      components={{
        MenuList: CustomMenuList,
        IndicatorsContainer: (props) => CustomIndicatorsContainer(props, handleClose, null)
      }}
      noOptionsMessage={handleEmptySource}
      onChange={handleOnChange}
      value={selectedSafe}
    />
  )
}

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

export default SourceWallet
