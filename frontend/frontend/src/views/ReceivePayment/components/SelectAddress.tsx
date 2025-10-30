import { ISource } from '@/slice/wallets/wallet-types'
import { IFormatOptionLabel } from '@/components/SelectItem/FormatOptionLabel'
import { SelectItem } from '@/components/SelectItem/SelectItem'
import { customStyles } from '@/constants/styles'
import { formatNumber } from '@/utils/formatNumber'
import CustomIndicatorsContainer from '@/views/TransferApp/components/ReactSelectComponents/CustomIndicatorsContainer'
import FormatOptionLabelAddress from '@/views/TransferApp/components/ReactSelectComponents/FormatOptionLabelAddress'
import React, { useCallback, useMemo, useState } from 'react'
import { ActionMeta, InputActionMeta, MultiValue } from 'react-select'

interface ISelectAddress {
  name: string
  sourceValue: IFormatOptionLabel

  onChange: (
    newValue: IFormatOptionLabel | MultiValue<IFormatOptionLabel>,
    actionMeta: ActionMeta<IFormatOptionLabel>
  ) => void
  availableSource: {
    availableSources: ISource[]
    loadingSource: boolean
  }
  setValue: any
  resetField: any
  setSourceValue: any
  isSearchable?: boolean
}

const SelectAddress: React.FC<ISelectAddress> = ({
  sourceValue,
  onChange: handleChange,
  availableSource,
  setValue,
  name,
  resetField,
  setSourceValue,
  isSearchable = true
}) => {
  // Hooks
  const [inputValue, setInputValue] = useState('')

  // Create option lists
  const optionSources: IFormatOptionLabel[] = useMemo(() => {
    const list: IFormatOptionLabel[] = []
    if (availableSource?.availableSources?.length > 0) {
      availableSource?.availableSources.forEach((item) => {
        list.push({
          value: item.address,
          label: item.name,
          address: item.address,
          totalPrice: formatNumber(item.totalPiceSource, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          }),
          typeAddress: item.sourceType,
          sourceId: item.id
        })
      })
    }
    return list
  }, [availableSource])

  const emptySource = useCallback(
    () =>
      availableSource?.loadingSource ? (
        <div className="flex gap-6 my-6 items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
          <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
          <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        </div>
      ) : (
        <span>No wallets found on this chain.</span>
      ),
    [availableSource]
  )
  const handleInputChange = (newValue: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === 'input-change') {
      setSourceValue(null)
      setInputValue(newValue)
      if (newValue) {
        setValue('address', newValue)
      } else {
        setValue('address', '')
      }
    }
    if (actionMeta.action === 'set-value') setInputValue('')
  }

  const handleClose = () => {
    setSourceValue(null)
    setInputValue('')
    setValue('address', '')
  }

  const customOptionLabel = (props) => <FormatOptionLabelAddress {...props} />

  return (
    <div className="w-full">
      <SelectItem
        name={name}
        isSearchable={isSearchable}
        options={optionSources}
        placeholder="Enter a wallet address or search from your saved wallets"
        customStyles={customStyles}
        formatOptionLabel={customOptionLabel}
        components={{
          IndicatorsContainer: (props) => CustomIndicatorsContainer(props, handleClose, inputValue)
        }}
        noOptionsMessage={() => emptySource()}
        onChange={handleChange}
        value={sourceValue || null}
        onInputChange={handleInputChange}
        inputValue={inputValue}
      />
    </div>
  )
}

export default SelectAddress
