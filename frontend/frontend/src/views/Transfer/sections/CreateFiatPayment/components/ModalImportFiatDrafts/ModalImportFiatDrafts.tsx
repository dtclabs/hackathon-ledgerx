/* eslint-disable arrow-body-style */
import { IPreviewFileRequest } from '@/api-v2/old-tx-api'
import {
  CurrencyType,
  PaymentStatus,
  useGetPaymentQuery,
  useGetPaymentRecipientsQuery,
  useLazyDownloadPaymentFileQuery
} from '@/api-v2/payment-api'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'
import { chartOfAccountsSelector } from '@/slice/chart-of-accounts/chart-of-accounts-selectors'
import { contactsSelector } from '@/slice/contacts/contacts-slice'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { fiatCurrenciesSelector, orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'
import { useAppSelector } from '@/state'
import { extractNameFromUUIDString } from '@/utils-v2/string-utils'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toShort } from '@/utils/toShort'
import useFiatPaymentLogicForm from '@/views/Transfer/hooks/useFiatPaymentForm/useFiatPaymentLogicForm'
import { useRouter } from 'next/router'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import DataViewDraft from '../../../CreatePayment/components/ModalImportDrafts/DataViewDraft/DataViewDraft'
import DraftFilterDropdown from '../../../CreatePayment/components/ModalImportDrafts/DraftFilterDropdown'

const DEFAULT_STATUS = [
  { value: PaymentStatus.APPROVED, label: 'Reviewed' },
  { value: PaymentStatus.PENDING, label: 'Pending review' },
  { value: PaymentStatus.FAILED, label: 'Failed' }
]

interface IProps {
  provider: any
  bankAccountOptions: any[]
}

const ModalImportFiatDraft: FC<IProps> = ({ provider, bankAccountOptions }) => {
  const ref = useRef(null)
  const tableProvider = useTableHook({})

  const router = useRouter()
  const organizationId = useOrganizationId()

  const { fiatCurrency } = useAppSelector(orgSettingsSelector)
  const chartOfAccounts = useAppSelector(chartOfAccountsSelector)
  const fiatCurrencies = useAppSelector(fiatCurrenciesSelector)
  const recipients = useAppSelector(contactsSelector)
  const wallets = useAppSelector(walletsSelector)
  const isOffRampEnabled = useAppSelector((state) => selectFeatureState(state, 'isOffRampEnabled'))

  const { getValues, addRecipient } = useFiatPaymentLogicForm()

  const [selectedDrafts, setSelectedDrafts] = useState<any[]>([])

  const [filters, setFilters] = useState({
    status: [],
    destinationAddress: [],
    cryptocurrency: []
  })

  const [downloadFile] = useLazyDownloadPaymentFileQuery()

  const {
    data: draftPayments,
    isLoading,
    refetch
  } = useGetPaymentQuery(
    {
      organizationId,
      params: {
        size: 9999,
        statuses: DEFAULT_STATUS?.map((status) => status.value),
        destinationCurrencyType: CurrencyType.FIAT
      },
      isOffRampEnabled
    },
    { skip: !organizationId }
  )
  const { data: paymentRecipients, refetch: recipientRefetch } = useGetPaymentRecipientsQuery(
    {
      organizationId,
      params: {
        destinationCurrencyType: CurrencyType.FIAT
      }
    },
    { skip: !organizationId }
  )

  const recipientOptions = useMemo(
    () =>
      paymentRecipients?.map((item) => ({
        value: `${item.address?.toLowerCase() || ''} ${item.name?.toLowerCase() || ''}`,
        label: item.name || toShort(item.address, 5, 5)
      })) || [],
    [paymentRecipients]
  )

  const parsedDrafts = useMemo(() => {
    const existedDrafts = getValues('recipients')?.filter((draft) => draft?.draftMetadata?.id)

    return draftPayments?.items
      ? draftPayments?.items?.map((draft) => {
          const files = (draft?.files || [])?.map((file) => ({
            name: file.slice(37),
            id: file
          }))

          const contactName = draft?.destinationName

          const chartOfAccount = chartOfAccounts?.find((coa) => coa?.id === draft?.chartOfAccount?.id) || null
          const isExisted = existedDrafts?.findIndex((_item) => _item.draftMetadata?.id === draft.id) > -1
          return {
            ...draft,
            files,
            chartOfAccount,
            contactName,
            disabled: isExisted,
            isSelected: isExisted,
            tooltip: 'You have already added this draft'
          }
        })
      : []
  }, [chartOfAccounts, draftPayments?.items, recipients, wallets])

  const parsedFilters = useMemo(() => {
    const clone = {}
    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      clone[filterKey] = filterValue.map((item) => item.value)
    })
    return clone
  }, [filters])

  useEffect(() => {
    if (provider.state.isOpen) {
      refetch()
    } else {
      setSelectedDrafts([])
      setFilters({
        status: [],
        destinationAddress: [],
        cryptocurrency: []
      })
    }
  }, [provider.state.isOpen])

  const handleChangeStatuses = (_statuses) => {
    setFilters({ ...filters, status: _statuses })
  }
  const handleChangeRecipients = (_recipients) => {
    setFilters({ ...filters, destinationAddress: _recipients })
  }
  const handleChangeAssets = (_assets) => {
    setFilters({ ...filters, cryptocurrency: _assets })
  }

  const handleOnClose = () => {
    provider.methods.setIsOpen(false)
    setSelectedDrafts([])
  }

  const handleImportDrafts = () => {
    // Import
    selectedDrafts?.forEach((draft) => {
      const parsedFiles: IPreviewFileRequest[] = draft?.files?.map((file) => {
        const result = extractNameFromUUIDString(file.id)
        if (result.isSuccess) {
          return {
            key: file,
            filename: result.data.fileName
          }
        }
        return {
          key: '',
          filename: ''
        }
      })

      addRecipient({
        bankAccount: bankAccountOptions?.find((item) => item.value === draft?.destinationMetadata?.id),
        amount: draft?.destinationAmount,
        tokenId: draft?.destinationCurrency?.code,
        files: parsedFiles,
        note: draft?.notes,
        chartOfAccountId: draft?.chartOfAccount?.id ?? '',
        purposeOfTransfer: draft?.metadata?.purposeOfTransfer,
        destinationCurrencyType: CurrencyType.FIAT,
        draftMetadata: {
          id: draft.id,
          status: draft.status,
          isImported: true
        },
        metadata: draft.destinationMetadata,
        walletAddress: draft.destinationAddress,
        walletId: draft.destinationMetadata?.id,
        annotations: draft?.annotations?.map((tag) => ({ value: tag.id, label: tag.name })) || [],
        isUnknown: false
      })
    })

    // close & clear
    provider.methods.setIsOpen(false)
    ref.current.toggleAllRowsSelected(false)
    setSelectedDrafts([])
    setFilters({
      status: [],
      destinationAddress: [],
      cryptocurrency: []
    })
  }

  const handleDownloadFile = (draftId: string, fileId: string) => {
    const fileName = fileId.slice(37)
    downloadFile({ organizationId, id: draftId, fileId, fileName })
  }

  const handleCreateDraft = () => {
    router.push(`/${organizationId}/transact/drafts?create`)
  }

  const selectAllHandler = useMemo(() => {
    const selectDraftIds = selectedDrafts?.map((item) => item.id)
    const unUsedDrafts = tableProvider.state.filteredItems?.filter((item) => !item.original?.disabled)

    if (unUsedDrafts?.every((item) => selectDraftIds.includes(item.original.id))) {
      return {
        label: 'Deselect all',
        onclick: () => ref.current.toggleAllRowsSelected(false)
      }
    }
    return {
      label: `Select all (${unUsedDrafts?.length})`,
      onclick: () => ref.current.toggleAllRowsSelected(true)
    }
  }, [selectedDrafts, tableProvider.state.filteredItems, draftPayments])

  return (
    <BaseModal provider={provider} classNames="h-full w-full flex flex-col rounded-none">
      <BaseModal.Header extendedClass="border-b pb-4 items-center">
        <BaseModal.Header.Title>Add from Draft Payments</BaseModal.Header.Title>
        <BaseModal.Header.CloseButton onClose={handleOnClose} />
      </BaseModal.Header>
      <BaseModal.Body extendedClass="h-full">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <DraftFilterDropdown
              name="Status"
              suffix="Statuses"
              options={DEFAULT_STATUS}
              value={filters?.status}
              onChange={handleChangeStatuses}
              onClear={() => handleChangeStatuses([])}
              isReset={provider.state.isOpen}
            />
            <DraftFilterDropdown
              name="Recipient"
              options={recipientOptions}
              value={filters?.destinationAddress}
              onChange={handleChangeRecipients}
              onClear={() => handleChangeRecipients([])}
              isReset={provider.state.isOpen}
            />
          </div>
          <div className="flex items-center gap-4">
            {selectedDrafts?.length > 0 && (
              <Typography color="tertiary">Selected payments: {selectedDrafts?.length}</Typography>
            )}
            {!isLoading && tableProvider.state.filteredItems?.length > 0 && (
              <Button
                variant="ghost"
                classNames="font-medium"
                label={selectAllHandler.label}
                height={32}
                onClick={selectAllHandler.onclick}
              />
            )}
          </div>
        </div>
        <DataViewDraft
          data={parsedDrafts}
          fiatCurrency={fiatCurrency}
          cryptocurrencyPrices={{}}
          setSelectedRows={setSelectedDrafts}
          onDownloadFile={handleDownloadFile}
          onCreateDraft={handleCreateDraft}
          isLoading={isLoading}
          tableRef={ref}
          filters={parsedFilters}
          tableProvider={tableProvider}
        />
      </BaseModal.Body>
      <BaseModal.Footer extendedClass="!justify-start">
        <BaseModal.Footer.SecondaryCTA label="Cancel" onClick={handleOnClose} />
        <Button
          height={48}
          variant="black"
          disabled={!selectedDrafts.length}
          label={`Add Selected Payments (${selectedDrafts?.length})`}
          onClick={handleImportDrafts}
          data-tip="import-csv-recipients"
          data-for="import-csv-recipients"
        />
      </BaseModal.Footer>
    </BaseModal>
  )
}
export default ModalImportFiatDraft
