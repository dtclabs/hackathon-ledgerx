import React, { useState, useEffect, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import Checkbox from '@/components/Checkbox/Checkbox'
import Image from 'next/legacy/image'
import { Dropdown } from '@/components-v2/molecules/Forms/Dropdown'
import * as Yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { FormGroup } from '@/components-v2/molecules/Forms'
import _ from 'lodash'
import Warning from '@/public/svg/icons/warning-icon-orange.svg'
import ReactTooltip from 'react-tooltip'
import FormatCoAOptionLabel from '../FormatCoAOptionLabel/FormatCoAOptionLabel'

interface ICustomMappingModal {
  provider: any
  assets: { icon: string; id: string; symbol: string }[]
  previousState: {
    assets: { icon: string; id: string; symbol: string }[]
    account: any
  }
  onConfirm: (asset, account, previousState) => void
  options?: any[]
  mappedAssets: any
  importedAccount: any[]
}
interface ICustomMappingForm {
  assets: any[]
  account: { value: string; label: string }
}

const AssetItem = ({ asset, importedAccount }) => {
  const mappedIn = importedAccount?.find((item) => item.id === asset.mappedIn)
  return (
    <div className="flex items-center gap-1">
      <Image src={asset.image} width={14} height={14} alt={asset.symbol} />
      <Typography variant="body2">{asset.symbol}</Typography>
      {asset.disabled && (
        <>
          <Image
            src={Warning}
            width={14}
            height={14}
            data-tip={`mapped-${asset.symbol}`}
            data-for={`mapped-${asset.symbol}`}
          />
          <ReactTooltip
            id={`mapped-${asset.symbol}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="top"
            className="!opacity-100 !rounded-lg"
          >
            Already mapped to {mappedIn.code ? `${mappedIn.code} - ${mappedIn.name}` : mappedIn.name}
          </ReactTooltip>
        </>
      )}
    </div>
  )
}
const validationSchema = Yup.object().shape({
  account: Yup.object().test('notEmpty', 'Account is required', (data) => !!data?.value),
  assets: Yup.array().test('notEmpty', 'Please select at least one asset', (data) => data?.length > 0)
})
const CustomMappingModal: React.FC<ICustomMappingModal> = ({
  provider,
  assets,
  previousState,
  mappedAssets,
  onConfirm,
  options,
  importedAccount
}) => {
  const { handleSubmit, formState, setValue, reset, watch } = useForm<ICustomMappingForm>({
    resolver: yupResolver(validationSchema)
  })

  useEffect(() => {
    reset({
      account: previousState?.account
        ? { label: previousState?.account?.label, value: previousState?.account.id }
        : { value: '', label: '' },
      assets: previousState?.assets || []
    })
  }, [provider.state.isOpen])

  const handleSelect = (_asset) => {
    const clone = [...watch('assets')]
    setValue(
      'assets',
      clone.find((prevItem) => prevItem.id === _asset.id)
        ? clone.filter((prevItem) => prevItem.id !== _asset.id)
        : [...clone, _asset]
    )
  }

  const onSubmit = (_data: ICustomMappingForm) => {
    provider.methods.setIsOpen(false)
    if (onConfirm) {
      onConfirm(_data.assets, _data.account, previousState)
    }
  }
  const handleChangeAccount = (account) => {
    setValue('account', account)
  }

  const parsedOptions = useMemo(
    () =>
      options?.map((option) => ({
        ...option,
        options: option?.options.map((item) => ({
          ...item,
          disabled: item.value === previousState?.account?.id ? false : item.disabled,
          isSelected: item.value === previousState?.account?.id
        }))
      })),

    [options, previousState.account]
  )

  const disableAssets = useMemo(() => {
    const transformedArray = _.flatMap(_.omit(mappedAssets, previousState?.account?.id)).filter((item) => !!item)

    const disabledAssets = assets?.map((asset) => {
      const isDisabled = transformedArray.includes(asset.id)
      return {
        ...asset,
        disabled: isDisabled,
        mappedIn: isDisabled ? Object.keys(mappedAssets).find((key) => mappedAssets[key].includes(asset.id)) : null
      }
    })
    return disabledAssets
  }, [mappedAssets, previousState.account, assets])

  return (
    <BaseModal provider={provider}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <BaseModal.Header>
          <BaseModal.Header.Title>Select Asset(s)</BaseModal.Header.Title>
          <BaseModal.Header.CloseButton />
        </BaseModal.Header>
        <BaseModal.Body>
          <Typography color="secondary" variant="body2">
            Select asset(s) to map to an account.
          </Typography>
          <FormGroup error={formState?.errors?.account?.message}>
            <div className="w-full mt-8">
              <Dropdown
                placeholder="Select account"
                sizeVariant="medium"
                options={parsedOptions}
                showCaret
                onChange={handleChangeAccount}
                formatOptionLabel={FormatCoAOptionLabel}
                value={watch('account')?.value ? watch('account') : null}
                isSearchable
              />
            </div>
          </FormGroup>
          <FormGroup error={formState?.errors?.assets?.message}>
            <div className="grid grid-cols-4 mt-8 mb-4 gap-y-8 gap-x-6 max-h-[292px] overflow-auto scrollbar">
              {disableAssets?.length &&
                disableAssets.map((asset) => (
                  <Checkbox
                    onChange={(e) => {
                      handleSelect(asset)
                    }}
                    isChecked={watch('assets')?.find((option) => option.id === asset.id)}
                    label={<AssetItem asset={asset} importedAccount={importedAccount} />}
                    className="flex items-center gap-3 pr-3"
                    key={asset.id}
                    disabled={asset.disabled}
                  />
                ))}
            </div>
          </FormGroup>
        </BaseModal.Body>
        <BaseModal.Footer>
          <BaseModal.Footer.SecondaryCTA onClick={() => provider.methods.setIsOpen(false)} label="Cancel" />
          <BaseModal.Footer.PrimaryCTA
            type="submit"
            label={`Confirm selection ${watch('assets')?.length ? `(${watch('assets')?.length})` : ''}`}
          />
        </BaseModal.Footer>
      </form>
    </BaseModal>
  )
}

export default CustomMappingModal
