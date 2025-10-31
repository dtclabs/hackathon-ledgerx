import { CurrencyType, IPayment, PaymentStatus } from '@/api-v2/payment-api'
import { UnderlineTabs } from '@/components-v2/UnderlineTabs'
import TabItem from '@/components/TabsComponent/TabItem'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { useAppSelector } from '@/state'
import { ITagHandler } from '@/views/Transactions-v2/interface'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { IDraftDetailForm } from '../../DraftTransactionListView'
import ActivityTab from './ActivityTab'
import OverviewTab from './OverviewTab'

const detailTabs = [
  {
    key: 'overview',
    name: 'Overview',
    active: true
  },
  {
    key: 'activity',
    name: 'Activity Log',
    active: false
  }
]

interface IDraftTransactionDetail {
  selectedData: IPayment
  settings: any
  verifiedTokens: { value: string; label: string; src: any }[]
  currencyOptions: any[]
  recipientOptions: any[]
  bankAccountOptions: any[]
  accountOptions: any
  reviewerOptions: { value: string; label: string }[]
  chartOfAccountsMap: any
  recipients: any
  onSaveContact: (address: string) => void
  setHasChanges: (changes: boolean) => void
  cryptocurrencyPrice: any
  tagsHandler: ITagHandler
  wallets: any[]
  hasChanges: boolean
  updatePaymentResponse: any
}

const DraftTransactionDetail: React.FC<IDraftTransactionDetail> = ({
  selectedData,
  settings,
  verifiedTokens,
  recipientOptions,
  currencyOptions,
  accountOptions,
  bankAccountOptions,
  recipients,
  reviewerOptions = [],
  chartOfAccountsMap,
  onSaveContact,
  setHasChanges,
  wallets,
  tagsHandler,
  cryptocurrencyPrice
}) => {
  const { reset, formState, setError, clearErrors, watch } = useFormContext<IDraftDetailForm>()
  const selectedChain = useAppSelector(selectedChainSelector)
  const [activeTab, setActiveTab] = useState<string>('overview')

  useEffect(() => {
    if (selectedData) {
      const coa = chartOfAccountsMap[selectedData?.chartOfAccount?.id]
      const recipient =
        selectedData?.destinationCurrencyType === CurrencyType.FIAT
          ? bankAccountOptions?.find((_recipient) => _recipient?.metadata?.id === selectedData?.destinationMetadata?.id)
          : recipientOptions?.find(
              (_recipient) => _recipient?.metadata?.id === selectedData?.destinationMetadata?.id
            ) || {
              value: selectedData?.destinationAddress,
              label: selectedData?.destinationName ?? null,
              address: selectedData?.destinationAddress,
              chainId: selectedChain?.id,
              metadata: selectedData?.destinationMetadata,
              isUnknown: !selectedData?.destinationMetadata?.id
            }

      reset({
        recipient,
        account: coa
          ? {
              value: coa?.id,
              label: coa?.code ? `${coa?.code} - ${coa?.name}` : coa?.name
            }
          : null,
        token:
          selectedData?.destinationCurrencyType === CurrencyType.FIAT
            ? currencyOptions?.find(
                (item) => item.value?.toLowerCase() === selectedData?.destinationCurrency?.code?.toLowerCase()
              )
            : verifiedTokens?.find(
                (item) => item.label?.toLowerCase() === selectedData?.destinationCurrency?.symbol?.toLowerCase()
              ),
        amount: selectedData?.destinationAmount ?? '',
        reviewer: reviewerOptions?.find((reviewer) => reviewer.label === selectedData?.reviewer?.account?.name) || {
          value: null,
          label: 'Anyone can review'
        },
        notes: selectedData?.notes ?? '',
        files: selectedData?.files?.map((file) => ({
          name: file.slice(37),
          id: file
        })),
        annotations:
          selectedData?.annotations?.map((annotation) => ({
            label: annotation?.name,
            value: annotation?.id
          })) || [],
        destinationCurrencyType: selectedData?.destinationCurrencyType
      })

      if (selectedData?.status === PaymentStatus.INVALID) {
        // Handle invalid payment
        setError('recipient', {
          message:
            'The recipient address was changed in the address book. Please enter/select the correct address and Save to fix the issue.'
        })
      }
    }
  }, [selectedData, verifiedTokens, recipientOptions])

  useEffect(() => {
    if (
      watch('recipient.address')?.toLowerCase() !== selectedData?.destinationAddress?.toLowerCase() ||
      watch('recipient.isUnknown')
    ) {
      clearErrors('recipient')
    }
  }, [selectedData?.destinationAddress, watch('recipient')])

  useEffect(() => {
    if (formState.isDirty) {
      setHasChanges(true)
    }
  }, [formState.isDirty])

  return (
    <div className="-mt-8">
      <UnderlineTabs
        tabs={detailTabs}
        active={activeTab}
        setActive={setActiveTab}
        classNameBtn="font-semibold text-sm px-6 py-[10px]"
        wrapperClassName="border-b-[1px] border-grey-200"
      >
        <TabItem key="overview">
          <OverviewTab
            data={selectedData}
            settings={settings}
            assetOptions={verifiedTokens}
            accountOptions={accountOptions}
            currencyOptions={currencyOptions}
            bankAccountOptions={bankAccountOptions}
            reviewerOptions={[...reviewerOptions, { value: null, label: 'Anyone can review' }]}
            onSaveContact={onSaveContact}
            wallets={wallets}
            recipients={recipients}
            selectedChain={selectedChain}
            recipientOptions={recipientOptions}
            setHasChanges={setHasChanges}
            cryptocurrencyPrice={cryptocurrencyPrice}
            tagsHandler={tagsHandler}
            annotations={watch('annotations')}
          />
        </TabItem>
        <TabItem key="activity">
          <ActivityTab data={selectedData} />
        </TabItem>
      </UnderlineTabs>
    </div>
  )
}

export default DraftTransactionDetail
