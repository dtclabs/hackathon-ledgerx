import { useUpdateFinancialTransactionMutation } from '@/api-v2/financial-tx-api'
import SelectDropdown from '@/components-v2/Select/Select'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import Accordion from '@/components-v2/molecules/Accordion'
import { TagManagementPopup } from '@/components-v2/molecules/TagManagementPopup'
import TagItem from '@/components-v2/molecules/TagManagementPopup/TagItem'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import TextField from '@/components/TextField/TextField'
import Tooltip, { ETooltipPosition } from '@/components/Tooltip/Tooltip'
import { CURRENCY_RELATED_CONSTANTS, isFeatureEnabledForThisEnv } from '@/config-v2/constants'
import Edit from '@/public/svg/Edit.svg'
import TooltipImage from '@/public/svg/Info.svg'
import AddIcon from '@/public/svg/icons/add-icon.svg'
import ArrowGreen from '@/public/svg/icons/arrow-green.svg'
import ArrowRight from '@/public/svg/icons/arrow-narrow-right.svg'
import ArrowRed from '@/public/svg/icons/arrow-red.svg'
import CaretIcon from '@/public/svg/icons/caret-icon.svg'
import CheckIcon from '@/public/svg/icons/check-icon.svg'
import CloseIcon from '@/public/svg/icons/close-icon.svg'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import { currencyToWord, numToWord, toNearestDecimal } from '@/utils-v2/numToWord'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toShort } from '@/utils/toShort'
import { format } from 'date-fns'
import { capitalize } from 'lodash'
import Image from 'next/legacy/image'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip'
import * as Yup from 'yup'
import FormatCoAOptionLabel from '../../TxGridTable/FormatCoAOptionLabel'
import { customCategoryStyles, handleCopyMessage, handleOnClickExternal } from '../../TxGridTable/TxGridTableRow'
import { ITagHandler, MAX_DISPLAY_TAGS } from '../../interface'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { ITag } from '@/slice/tags/tag-type'
import { EPlacement } from '@/components/DropDown/DropDown'

interface ITaxLotItem {
  label: string
  hash: string
  soldAmount: string
  costBasisAmount: string
  costBasisFiatCurrency: string
  purchasedAt: string
  currentType: string
  cryptocurrency: any
}

interface IInfoTab {
  selectedItem: any
  chartOfAccounts: any[]
  taxlots: ITaxLotItem[]
  tagsHandler: ITagHandler
  tags: ITag[]
}

const validateAmount = (_amount: any) => {
  const schema = Yup.number().required()

  return schema.isValidSync(_amount)
}

const InfoTab: React.FC<IInfoTab> = ({ selectedItem, chartOfAccounts, taxlots, tagsHandler, tags }) => {
  const [updateFinnacialTx, updateFinnacialTxResult] = useUpdateFinancialTransactionMutation()
  const [value, setValue] = useState<any>()
  const [isTaxlotsExpanded, setIsTaxlotsExpanded] = useState<boolean>(false)
  const [editValueErrors, setEditValueErrors] = useState({
    amount: null,
    costBasis: null,
    fairMarket: null
  })
  const [editAmount, setEditAmount] = useState(false)
  const [editCostBasis, setEditCostBasis] = useState(false)
  const [editFairMarketValue, setEditFairMarketValue] = useState(false)
  const [costBasisValue, setCostBasisValue] = useState(selectedItem?.costBasis)
  const [amountValue, setAmountValue] = useState(selectedItem?.fiatAmount)
  const [fairMarketValue, setFairMarketValue] = useState(selectedItem?.fiatAmountPerUnit)
  const orgId = useOrganizationId()
  const {
    timezone: timeZonesetting,
    country: countrySetting,
    fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)
  const supportedChains = useAppSelector(supportedChainsSelector)
  const isAnnotationEnabled = useAppSelector((state) => selectFeatureState(state, 'isAnnotationEnabled'))

  useEffect(() => {
    setCostBasisValue(selectedItem?.costBasis)
    setAmountValue(selectedItem?.fiatAmount)
    setFairMarketValue(selectedItem?.fiatAmountPerUnit)
    setIsTaxlotsExpanded(false)
  }, [selectedItem])

  useEffect(() => {
    setValue(
      selectedItem?.correspondingChartOfAccount
        ? {
            value: selectedItem?.correspondingChartOfAccount?.id,
            label: selectedItem?.correspondingChartOfAccount?.code
              ? `${selectedItem?.correspondingChartOfAccount?.code} - ${selectedItem?.correspondingChartOfAccount?.name}`
              : selectedItem?.correspondingChartOfAccount?.name
          }
        : null
    )
  }, [selectedItem?.correspondingChartOfAccount])

  useEffect(() => {
    if (updateFinnacialTxResult.isSuccess) {
      toast.success('Transaction updated')
      setEditAmount(false)
      setEditFairMarketValue(false)
    }
  }, [updateFinnacialTxResult])

  const handleChangeCategory = (category) => {
    setValue({
      value: category?.value ?? category?.id,
      label: category?.code ? `${category?.code} - ${category?.name}` : category?.name
    })
    updateFinnacialTx({
      orgId,
      id: selectedItem.id,
      payload: {
        correspondingChartOfAccountId: category.value
      },
      optimisticAccount: {
        id: category?.value || category?.id,
        code: category?.code ?? '',
        name: category?.name ?? ''
      }
    })
  }

  const onClickEditAmount = () => {
    setEditAmount(!editAmount)
  }

  const onClickEditCostBasis = () => {
    setEditCostBasis(!editCostBasis)
  }

  const onClickEditFairMarketValue = () => {
    setEditFairMarketValue(!editFairMarketValue)
  }

  const handleOnChangeAmount = (e) => {
    setAmountValue(e.target.value)
    if (!validateAmount(e.target.value)) {
      setEditValueErrors({
        ...editValueErrors,
        amount: 'Please enter numbers only'
      })
    } else {
      setEditValueErrors({
        ...editValueErrors,
        amount: null
      })
    }
  }

  const handleOnChangeFairMarket = (e) => {
    setFairMarketValue(e.target.value)
    if (!validateAmount(e.target.value)) {
      setEditValueErrors({
        ...editValueErrors,
        fairMarket: 'Please enter numbers only'
      })
    } else {
      setEditValueErrors({
        ...editValueErrors,
        fairMarket: null
      })
    }
  }

  const handleOnChangeCostBasis = (e) => {
    setCostBasisValue(e.target.value)
    if (!validateAmount(e.target.value)) {
      setEditValueErrors({
        ...editValueErrors,
        costBasis: 'Please enter numbers only'
      })
    } else {
      setEditValueErrors({
        ...editValueErrors,
        costBasis: null
      })
    }
  }

  const onClickUpdateAmount = () => {
    updateFinnacialTx({
      orgId,
      id: selectedItem.id,
      payload: { amount: parseFloat(amountValue) }
    })
  }

  const onClickUpdateFairMarketValue = () => {
    updateFinnacialTx({
      orgId,
      id: selectedItem.id,
      payload: { amountPerUnit: parseFloat(fairMarketValue) }
    })
  }

  const onClickUpdateCostBasis = () => {
    updateFinnacialTx({
      orgId,
      id: selectedItem.id,
      payload: { costBasis: parseFloat(costBasisValue) }
    })
  }

  const onClickCancelUpdateAmount = () => {
    setEditAmount(false)
  }

  const incoming = useMemo(() => selectedItem?.direction === 'incoming', [selectedItem?.direction])
  const isPositive = useMemo(
    () => parseFloat(parseFloat(selectedItem?.gainLoss).toFixed(2)) > 0,
    [selectedItem?.gainLoss]
  )

  const renderButton = (onClick) => (
    <Button
      height={24}
      variant="ghost"
      classNames="font-medium py-1 px-[5px] rounded"
      leadingIcon={<Image src={AddIcon} width={12} height={12} />}
      onClick={onClick}
    />
  )

  const tagsSelection = useMemo(
    () => (
      <div className="flex flex-wrap gap-1 max-w-[300px] justify-end">
        {(tags || selectedItem?.annotations)?.length > 0 ? (
          <>
            {(tags || selectedItem.annotations).slice(0, MAX_DISPLAY_TAGS).map((tag) => (
              <TagItem
                key={tag.id}
                tag={{ value: tag.id, label: tag.name }}
                onClear={(_tag) => {
                  tagsHandler.onDeleteAnnotation(_tag, selectedItem.id)
                }}
              />
            ))}

            {(tags || selectedItem.annotations).length > MAX_DISPLAY_TAGS ? (
              <>
                <div
                  className="flex items-center gap-2 bg-neutral-100 py-1 px-2 rounded"
                  data-tip={`extra-tags-${selectedItem.id}`}
                  data-for={`extra-tags-${selectedItem.id}`}
                >
                  <Typography classNames="!text-neutral-900" styleVariant="regular" variant="caption">
                    +{(tags || selectedItem.annotations).length - MAX_DISPLAY_TAGS}
                  </Typography>
                </div>
                <ReactTooltip
                  id={`extra-tags-${selectedItem.id}`}
                  borderColor="#eaeaec"
                  border
                  place="top"
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  className="!opacity-100 !rounded-lg max-w-[200px] !px-3"
                >
                  <div className="flex flex-wrap gap-1">
                    {(tags || selectedItem.annotations).slice(MAX_DISPLAY_TAGS).map((tag) => (
                      <TagItem key={tag.id} tag={{ value: tag.id, label: tag.name }} clearable={false} />
                    ))}
                  </div>
                </ReactTooltip>
              </>
            ) : null}
          </>
        ) : null}
        <TagManagementPopup
          placement={EPlacement.BESIDE}
          options={tagsHandler.options}
          tags={(tags || selectedItem?.annotations)?.map((_tag) => ({ label: _tag.name, value: _tag.id })) || []}
          onChange={(_tag) => {
            tagsHandler.onAttachAnnotation(_tag, selectedItem.id)
          }}
          onClear={(_tag) => {
            tagsHandler.onDeleteAnnotation(_tag, selectedItem.id)
          }}
          onCreate={(_tagName) => {
            tagsHandler.onCreate(_tagName, selectedItem.id)
          }}
          onDelete={tagsHandler.onDelete}
          onEdit={tagsHandler.onUpdate}
          triggerButton={(tags || selectedItem?.annotations)?.length > 0 && renderButton}
        />
      </div>
    ),
    [selectedItem, tags, tagsHandler?.options]
  )

  return (
    <div className="font-inter mt-2">
      <div className="flex flex-row justify-between text-sm pb-4" style={{ borderBottom: '1px solid #F1F1EF' }}>
        <div className="p-4 pl-0 flex flex-col basis-2/5">
          <div className="w-min">
            <Typography classNames="mb-2" color="secondary">
              From
            </Typography>
            <div style={{ color: '#344054' }}>
              <Typography classNames="mb-2" color="dark">
                {selectedItem?.fromContact?.name ?? 'Unknown Address'}
              </Typography>
              {selectedItem?.fromAddress && (
                <WalletAddress split={5} address={selectedItem?.fromAddress} color="dark">
                  <WalletAddress.Link address={selectedItem?.fromAddress} options={supportedChains} />
                  <WalletAddress.Copy address={selectedItem?.fromAddress} />
                </WalletAddress>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 pt-3 basis-1/5">
          {selectedItem?.proxyAddress && (
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              shortText={<SVGIcon name="CategoryIcon" width={14} height={14} stroke="#667085" />}
              text={
                <Typography classNames="p-2 cursor-default" variant="body2">
                  Proxy Contract
                </Typography>
              }
            />
          )}
          <Image src={ArrowRight} height={16} width={16} />
        </div>
        <div className="p-4 pr-0 flex flex-col basis-2/5 items-end">
          <div className="w-min">
            <Typography classNames="mb-2" color="secondary">
              To
            </Typography>
            {selectedItem?.toContact ? (
              <div style={{ color: '#344054' }}>
                <Typography classNames="mb-2" color="dark">
                  {selectedItem?.toContact?.name ?? 'Unknown Address'}
                </Typography>
                <div>
                  {selectedItem?.toAddress && (
                    <WalletAddress split={5} address={selectedItem?.toAddress} color="dark">
                      <WalletAddress.Link
                        address={selectedItem?.toAddress}
                        options={supportedChains}
                        placement="left"
                      />
                      <WalletAddress.Copy address={selectedItem?.toAddress} />
                    </WalletAddress>
                  )}
                </div>
              </div>
            ) : selectedItem?.toAddress ? (
              <div style={{ color: '#344054' }} className="flex flex-col ">
                <Typography classNames="mb-2 text-left">Unknown Address</Typography>
                {selectedItem?.toAddress && (
                  <WalletAddress split={5} address={selectedItem?.toAddress} color="dark">
                    <WalletAddress.Link address={selectedItem?.toAddress} options={supportedChains} placement="left" />
                    <WalletAddress.Copy address={selectedItem?.toAddress} />
                  </WalletAddress>
                )}
              </div>
            ) : (
              <Typography classNames="flex justify-center items-center mt-5">-</Typography>
            )}
          </div>
        </div>
      </div>
      <div className="mt-6 pb-6" style={{ borderBottom: '1px solid #F1F1EF' }}>
        <Typography variant="body2" color="black" styleVariant="semibold">
          Transfer details
        </Typography>
        <div className="mt-4">
          <div className="flex flex-row justify-between" style={{ fontSize: 14, color: '#667085' }}>
            <Typography color="dark" variant="body2">
              Date & Time
            </Typography>
            <Typography color="dark" variant="body2">
              {selectedItem?.valueTimestamp &&
                formatTimeBasedonUTCOffset(
                  selectedItem?.valueTimestamp,
                  timeZonesetting?.utcOffset || 480,
                  countrySetting?.iso || 'SG'
                )}
            </Typography>
          </div>
          <div className="flex flex-row justify-between mt-5" style={{ fontSize: 14, color: '#667085' }}>
            <Typography color="dark" variant="body2">
              Type
            </Typography>
            <Typography color="dark" variant="body2">
              {capitalize(selectedItem?.typeDetail?.label)}
            </Typography>
          </div>
          {isFeatureEnabledForThisEnv && (
            <div className="flex flex-row justify-between mt-5" style={{ fontSize: 14, color: '#667085' }}>
              <Typography color="dark" variant="body2">
                Chain
              </Typography>
              <div className="flex items-center gap-x-1">
                <Image
                  src={supportedChains?.filter((chain) => chain.id === selectedItem?.blockchainId)[0]?.imageUrl}
                  width={14}
                  height={14}
                  className="rounded"
                />
                <Typography variant="body2" color="dark">
                  {supportedChains?.filter((chain) => chain.id === selectedItem?.blockchainId)[0]?.name}
                </Typography>
              </div>
            </div>
          )}
          <div className="flex flex-row justify-between mt-5 h-[60px]" style={{ fontSize: 14, color: '#667085' }}>
            <Typography variant="body2" color="dark">
              Amount {incoming ? '(In)' : '(Out)'}
            </Typography>
            {selectedItem?.cryptocurrencyAmount !== '0' ? (
              <div>
                <div className="flex flex-row gap-2 justify-end items-center">
                  <img alt="" src={selectedItem?.cryptocurrency?.image?.small} width={15} />
                  <Typography classNames={incoming ? 'text-[#0BA740]' : 'text-[#B41414]'}>
                    {selectedItem?.cryptocurrencyAmount}
                  </Typography>
                  <Typography variant="body2" color="dark">
                    {selectedItem?.cryptocurrency?.symbol}
                  </Typography>
                </div>
                <div className="mt-2 text-right flex flex-row items-center justify-end">
                  {editAmount ? (
                    <div>
                      <Typography classNames="flex flex-row items-center gap-3">
                        {fiatCurrencySetting?.symbol}
                        <TextField
                          name="amount"
                          onChange={handleOnChangeAmount}
                          value={amountValue}
                          classNameInput="focus:outline-none text-sm text-dash placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter border border-[#EAECF0] focus:shadow-textFieldRecipient"
                        />

                        <div className="flex flex-row items-center gap-2">
                          <Image className="cursor-pointer" src={CheckIcon} onClick={onClickUpdateAmount} />
                          <Image className="cursor-pointer" src={CloseIcon} onClick={onClickCancelUpdateAmount} />
                        </div>
                      </Typography>
                      <Typography classNames="pb-2" color="error">
                        {editValueErrors.amount && editValueErrors.amount}
                      </Typography>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Tooltip
                        arrow={false}
                        position={ETooltipPosition.TOP}
                        shortText={
                          <Typography classNames="flex flex-row items-center">
                            {fiatCurrencySetting?.symbol}
                            <Typography>
                              {toNearestDecimal(selectedItem?.fiatAmount, countrySetting?.iso, 2)}{' '}
                              {selectedItem?.fiatCurrency || 'USD'}
                            </Typography>
                          </Typography>
                        }
                        text={
                          <Typography classNames="text-xs">
                            {fiatCurrencySetting?.symbol}
                            {toNearestDecimal(selectedItem?.fiatAmount, countrySetting?.iso, 16)}{' '}
                            {selectedItem?.fiatCurrency || 'USD'}
                          </Typography>
                        }
                      />
                      <div className="ml-3 flex justify-center">
                        <Image className="cursor-pointer" onClick={onClickEditAmount} src={Edit} width={15} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              '-'
            )}
          </div>
          <div
            className="flex flex-row items-center justify-between mt-1 h-[45px]"
            style={{ fontSize: 14, color: '#667085' }}
          >
            <Typography variant="body2" color="dark">
              Fair Market Value
            </Typography>
            <div>
              <div className="mt-2 text-right flex flex-row items-center justify-end">
                {editFairMarketValue ? (
                  <div>
                    <div className="flex flex-row items-center gap-3">
                      <Typography variant="body2" color="dark">
                        {fiatCurrencySetting?.symbol}
                      </Typography>
                      <TextField
                        name="amount"
                        onChange={handleOnChangeFairMarket}
                        value={fairMarketValue}
                        classNameInput="focus:outline-none text-sm text-dash placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter border border-[#EAECF0] focus:shadow-textFieldRecipient"
                      />
                      <div className="flex flex-row items-center gap-2">
                        <Image className="cursor-pointer" src={CheckIcon} onClick={onClickUpdateFairMarketValue} />
                        <Image className="cursor-pointer" src={CloseIcon} onClick={onClickEditFairMarketValue} />
                      </div>
                    </div>

                    <Typography classNames="pb-2" color="error">
                      {' '}
                      {editValueErrors.fairMarket && editValueErrors.fairMarket}
                    </Typography>
                  </div>
                ) : (
                  <div className="flex flex-row items-center">
                    <Tooltip
                      arrow={false}
                      position={ETooltipPosition.TOP}
                      className="bottom-2"
                      shortText={
                        <Typography classNames="flex flex-row items-center">
                          {fiatCurrencySetting?.symbol}
                          <Typography>
                            {toNearestDecimal(selectedItem?.fiatAmountPerUnit, countrySetting?.iso, 3)}{' '}
                            {selectedItem?.fiatCurrency || 'USD'}
                          </Typography>
                        </Typography>
                      }
                      text={
                        <Typography variant="caption">
                          {fiatCurrencySetting?.symbol}
                          {toNearestDecimal(selectedItem?.fiatAmountPerUnit, countrySetting?.iso, 16)}{' '}
                          {selectedItem?.fiatCurrency || 'USD'}
                        </Typography>
                      }
                    />
                    <div className="ml-3 flex justify-center">
                      <Image
                        className="cursor-pointer"
                        onClick={onClickEditFairMarketValue}
                        src={Edit}
                        width={15}
                        data-tip="changing-fmv"
                        data-for="changing-fmv"
                      />
                    </div>
                    <ReactTooltip
                      id="changing-fmv"
                      borderColor="#eaeaec"
                      border
                      place="top"
                      backgroundColor="white"
                      textColor="#111111"
                      effect="solid"
                      className="!opacity-100 !rounded-lg max-w-[220px] text-left"
                    >
                      <Typography variant="caption">
                        Changing FMV will change the total price of this transaction
                      </Typography>
                    </ReactTooltip>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#667085' }} className="flex flex-row justify-between mt-6">
            <Typography variant="body2" color="dark">
              Transaction Hash
            </Typography>
            <div className="flex flex-row gap-2 items-center">
              <Typography variant="body2" color="dark">
                {toShort(selectedItem?.hash, 5, 4)}
              </Typography>
              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  onClick={handleOnClickExternal(
                    selectedItem?.hash,
                    supportedChains?.find((chain) => chain.id === selectedItem?.blockchainId)?.blockExplorer
                  )}
                >
                  <SVGIcon name="ExternalLinkIcon" width={14} height={14} />
                </button>
                <button type="button" onClick={handleCopyMessage(selectedItem?.hash)}>
                  <SVGIcon name="CopyIcon" width={14} height={14} />
                </button>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#667085' }} className="flex flex-row justify-between mt-5">
            <Typography variant="body2" color="dark">
              Reference ID
            </Typography>
            <div className="flex gap-2">
              <Typography variant="body2" color="dark">
                {selectedItem?.id}
              </Typography>
              <button type="button" onClick={handleCopyMessage(selectedItem?.id)}>
                <SVGIcon name="CopyIcon" width={14} height={14} />
              </button>
            </div>
          </div>
          {selectedItem?.proxyAddress && (
            <div style={{ fontSize: 14, color: '#667085' }} className="flex flex-row justify-between mt-5">
              <div className="flex items-center gap-2">
                <SVGIcon name="CategoryIcon" width={14} height={14} stroke="#667085" />
                <Typography variant="body2" color="dark">
                  Proxy Contract
                </Typography>
              </div>
              {selectedItem?.proxyAddress && (
                <WalletAddress split={5} address={selectedItem?.proxyAddress} color="dark">
                  <WalletAddress.Link address={selectedItem?.proxyAddress} options={supportedChains} placement="left" />
                  <WalletAddress.Copy address={selectedItem?.proxyAddress} />
                </WalletAddress>
              )}
            </div>
          )}
        </div>
      </div>
      <Typography variant="body2" color="black" styleVariant="semibold" classNames="mt-5">
        Accounting
      </Typography>
      <div
        className="flex flex-row justify-between items-center mt-1 h-[45px]"
        style={{ fontSize: 14, color: '#667085' }}
      >
        <Typography variant="body2" color="dark">
          Cost Basis
        </Typography>
        <div className=" text-right flex flex-row items-center justify-end">
          <div className="flex flex-row items-center">
            {selectedItem?.costBasis && !incoming ? (
              <div className="flex flex-row items-center">
                <Tooltip
                  arrow={false}
                  position={ETooltipPosition.TOP}
                  className="bottom-2 left-[-24px]"
                  shortText={
                    <Typography classNames="flex flex-row items-center">
                      {fiatCurrencySetting?.symbol}
                      <Typography>
                        {toNearestDecimal(selectedItem?.costBasis, countrySetting?.iso, 3)}{' '}
                        {selectedItem?.fiatCurrency || 'USD'}
                      </Typography>
                    </Typography>
                  }
                  text={
                    <Typography variant="caption">
                      {fiatCurrencySetting?.symbol}
                      {toNearestDecimal(selectedItem?.costBasis, countrySetting?.iso, 16)}{' '}
                      {selectedItem?.fiatCurrency || 'USD'}
                    </Typography>
                  }
                />
              </div>
            ) : (
              '-'
            )}
          </div>
        </div>
      </div>
      <div>
        <Accordion
          wrapperClassName={`border border-[#F2F4F7] cursor-pointer ${taxlots?.length === 0 ? 'opacity-50' : ''}`}
          isExpand={isTaxlotsExpanded}
          fullWidth
          disabled={taxlots?.length === 0}
          expandElement={
            <div className="!bg-white cursor-default max-h-[150px] overflow-y-auto">
              {taxlots?.map((taxLot) => (
                <div key={taxLot?.hash} className="flex justify-between border border-[#F2F4F7] p-3">
                  <div>
                    <WalletAddress variant="caption" split={5} address={taxLot?.hash} color="dark">
                      <WalletAddress.Link
                        linkType="transaction"
                        address={taxLot?.hash}
                        options={[supportedChains?.find((chain) => chain.id === selectedItem?.blockchainId)]}
                      />
                      <WalletAddress.Copy address={taxLot?.hash} />
                    </WalletAddress>
                    <div>
                      {' '}
                      <Typography variant="caption">
                        {format(new Date(taxLot.purchasedAt), 'd MMM yyyy, h:m b')}
                      </Typography>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-end gap-1">
                      <img alt="" src={taxLot.cryptocurrency?.image?.small} width={14} height={14} />
                      <Typography color="black" variant="caption">{`${numToWord(
                        taxLot.soldAmount,
                        CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                        5
                      )} ${taxLot.cryptocurrency?.symbol}`}</Typography>
                    </div>
                    <div className="flex justify-end">
                      <Typography variant="caption">{`${fiatCurrencySetting?.symbol}${currencyToWord(
                        taxLot.costBasisAmount,
                        CURRENCY_RELATED_CONSTANTS.numToWordThreshold,
                        countrySetting?.iso,
                        2
                      )} ${taxLot.costBasisFiatCurrency?.toUpperCase()}`}</Typography>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
          setIsExpand={setIsTaxlotsExpanded}
        >
          <div
            data-for="disabled-cost-basis-tooltip"
            data-tip="disabled-cost-basis-tooltip"
            className="flex justify-between items-center w-full bg-[#F9FAFB] px-3 py-3"
          >
            <div className="flex flex-row gap-2">
              <Typography variant="caption">Past Records</Typography>
              <Image
                data-for="cost-basis-tooltip"
                data-tip="cost-basis-tooltip"
                src={TooltipImage}
                alt="tooltip"
                height={12}
                width={12}
              />
              {taxlots?.length > 0 && (
                <ReactTooltip
                  id="cost-basis-tooltip"
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg max-w-[260px]"
                >
                  <p className="font-inter font-medium text-xs">
                    Pricing history of previous prices that the asset was acquired for.
                  </p>
                </ReactTooltip>
              )}
              {taxlots?.length === 0 && (
                <ReactTooltip
                  id="disabled-cost-basis-tooltip"
                  borderColor="#eaeaec"
                  border
                  backgroundColor="white"
                  textColor="#111111"
                  effect="solid"
                  place="top"
                  className="!opacity-100 !rounded-lg max-w-[260px]"
                >
                  <p className="font-inter font-medium text-xs">No pricing history for this current transaction.</p>
                </ReactTooltip>
              )}
            </div>
            <Image
              src={CaretIcon}
              alt="caret"
              height={12}
              width={12}
              className={`${isTaxlotsExpanded ? 'rotate-180' : ''} transition-transform`}
            />
          </div>
        </Accordion>
      </div>
      <div className="flex flex-row justify-between mt-5" style={{ fontSize: 14, color: '#667085' }}>
        <Typography variant="body2" color="dark">
          Realized Gain/Loss
        </Typography>
        {selectedItem?.gainLoss ? (
          <p className={`${isPositive ? 'text-[#0BA740]' : 'text-[#B41414]'}`}>
            <Tooltip
              arrow={false}
              position={ETooltipPosition.TOP}
              className="bottom-2 left-[-24px]"
              shortText={
                <div className="flex items-center flex-row gap-1">
                  <Image src={isPositive ? ArrowGreen : ArrowRed} height={15} width={15} />
                  {`${!isPositive ? '-' : ''}${fiatCurrencySetting?.symbol}${
                    toNearestDecimal(selectedItem?.gainLoss.replace('-', ''), countrySetting?.iso, 3)
                    /** Query BERFORE MERGE - Do we need to convert to int or shall we show the full value ? 
              Example - 6448 OR 6448.0520540322896 */
                  } ${selectedItem?.fiatCurrency.toUpperCase()}`}
                </div>
              }
              text={
                <Typography color={isPositive ? 'success' : 'error'} variant="caption">
                  {!isPositive ? '-' : ''}
                  {fiatCurrencySetting?.symbol}
                  {toNearestDecimal(selectedItem?.gainLoss.replace('-', ''), countrySetting?.iso, 16)}{' '}
                  {selectedItem?.fiatCurrency || 'USD'}
                </Typography>
              }
            />
          </p>
        ) : (
          '-'
        )}
      </div>
      <div className="flex flex-row justify-between items-center mt-5" style={{ fontSize: 14, color: '#667085' }}>
        <Typography variant="body2" color="dark">
          Account
        </Typography>
        <SelectDropdown
          styles={customCategoryStyles}
          disableIndicator
          isSearchable
          className="w-[220px]"
          name="category"
          options={chartOfAccounts}
          onChange={handleChangeCategory}
          formatOptionLabel={FormatCoAOptionLabel}
          menuPlacement="top"
          value={value || { value: '', label: 'Select account' }}
        />
      </div>
      {isAnnotationEnabled && (
        <div className="flex flex-row items-center justify-between mt-5" style={{ fontSize: 14, color: '#667085' }}>
          <Typography variant="body2" color="dark">
            Labels
          </Typography>
          {tagsSelection}
        </div>
      )}
    </div>
  )
}

export default InfoTab
