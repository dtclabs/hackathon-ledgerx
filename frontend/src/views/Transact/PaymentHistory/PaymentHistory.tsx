import { IPreviewFileRequest } from '@/api-v2/old-tx-api'
import { CurrencyType, IPayment, PaymentStatus, ProviderStatus, useGetPaymentQuery } from '@/api-v2/payment-api'
import { Input } from '@/components-v2'
import { SideModal } from '@/components-v2/SideModal'
import Typography from '@/components-v2/atoms/Typography'
import { ProfileInfoDisplay } from '@/components-v2/molecules/ProfileInfoDisplay'
import { useTableHook } from '@/components-v2/molecules/Tables/TableV2/table-v2-ctx'
import View, { Header } from '@/components-v2/templates/AuthenticatedView/AuthenticatedView'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import AlertIcon from '@/public/svg/icons/alert-circle-icon.svg'
import { selectVerifiedCryptocurrencyMap } from '@/slice/cryptocurrencies/cryptocurrency-selector'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { updateReviewData } from '@/slice/transfer/transfer.slice'
import { useAppDispatch, useAppSelector } from '@/state'
import { extractNameFromUUIDString } from '@/utils-v2/string-utils'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { RecipientType } from '@/views/Transfer/Transfer.types'
import { format } from 'date-fns'
import { debounce } from 'lodash'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import { useMemo, useRef, useState } from 'react'
import { PaymentDetail } from './components/PaymentDetail'
import PaymentHistoryTable from './components/PaymentHistoryTable'
import StatusFilter from './components/StatusFilter'
import useBankAccounts from '@/views/Transfer/hooks/useBankAccounts'

const STATUS = [PaymentStatus.EXECUTED, PaymentStatus.SYNCED]
const PROVIDER_STATUS = [ProviderStatus.COMPLETED, ProviderStatus.FAILED, ProviderStatus.PENDING]

const PaymentHistory = () => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const dispatch = useAppDispatch()
  const settings = useAppSelector(orgSettingsSelector)
  const verifiedCryptoCurrencyMap = useAppSelector(selectVerifiedCryptocurrencyMap)

  const { bankAccountOptions } = useBankAccounts()

  const provider = useTableHook({})
  const searchRef = useRef(null)

  const [selectedRow, setSelectedRow] = useState<IPayment>(null)
  const [search, setSearch] = useState('')
  const [filterStatuses, setFilterStatuses] = useState<{ label: string; providerStatuses: string }>({
    label: 'All',
    providerStatuses: ''
  })

  const {
    data: draftPayments,
    isLoading,
    isFetching
  } = useGetPaymentQuery(
    {
      organizationId,
      params: {
        search,
        order: 'executedAt',
        direction: 'DESC',
        statuses: STATUS,
        // providerStatuses: filterStatuses?.providerStatuses ? [filterStatuses?.providerStatuses] : PROVIDER_STATUS,
        page: provider.state.pageIndex,
        size: provider.state.pageSize
      },
      isOffRampEnabled: true
    },
    {
      skip: !organizationId,
      refetchOnMountOrArgChange: true
    }
  )

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }
  const handleChangeStatus = (status) => {
    setFilterStatuses(status)
  }
  const onClickEmptyDataCta = () => router.push(`/${organizationId}/transfer`)

  const handleMakePayment = (_draft: IPayment) => {
    const parsedFiles: IPreviewFileRequest[] = _draft.files?.map((file) => {
      const result = extractNameFromUUIDString(file)

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
    dispatch(
      updateReviewData({
        sourceWalletId: '',
        recipients: [
          {
            amount: _draft.destinationAmount,
            chartOfAccountId: _draft?.chartOfAccount?.id ?? '',
            walletAddress: _draft.destinationAddress,
            walletId: _draft.destinationMetadata?.id,
            bankAccount:
              _draft?.destinationCurrencyType === CurrencyType.FIAT
                ? bankAccountOptions?.find((_recipient) => _recipient?.metadata?.id === _draft?.destinationMetadata?.id)
                : null,
            tokenId:
              _draft?.destinationCurrencyType === CurrencyType.FIAT
                ? _draft.destinationCurrency?.code
                : verifiedCryptoCurrencyMap[_draft.destinationCurrency?.symbol?.toLowerCase()]?.publicId,
            metadata: _draft.destinationMetadata?.id
              ? {
                  id: _draft.destinationMetadata?.id,
                  type: _draft.destinationMetadata?.type as RecipientType
                }
              : null,
            purposeOfTransfer: _draft?.metadata?.purposeOfTransfer,
            draftMetadata: {
              id: _draft.id,
              status: _draft.status,
              isImported: true
            },
            files: parsedFiles,
            note: _draft.notes,
            annotations: _draft?.annotations?.map((tag) => ({ value: tag.id, label: tag.name })) || [],
            isUnknown: !_draft.destinationMetadata?.id
          }
        ]
      })
    )
    // dispatch(setMakePaymentDrafts([_draft || selectedRow]))
    router.push(
      `/${organizationId}/transfer/${_draft?.destinationCurrencyType === CurrencyType.CRYPTO ? 'crypto' : 'fiat'}`
    )
  }

  const actionHandler: any = useMemo(() => {
    const retryPayment = {
      label: 'Retry Payment',
      onClick: handleMakePayment
    }

    switch (selectedRow?.providerStatus) {
      case ProviderStatus.FAILED:
        return retryPayment

      default:
        return null
    }
  }, [selectedRow])

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>Payment History</Header.Left.Title>
        </Header.Left>
      </Header>
      <View.Content>
        <div className="flex flex-row gap-2 items-center flex-1 mb-4 mt-1 justify-between">
          <div className="w-1/4">
            <Input
              placeholder="Search by recipient name"
              onChange={debounce(handleSearch, 300)}
              isSearch
              classNames="h-[32px]"
              ref={searchRef}
            />
          </div>
          <StatusFilter onChangeStatus={handleChangeStatus} status={filterStatuses} />
        </div>
        <PaymentHistoryTable
          data={draftPayments?.items}
          isLoading={isLoading || isFetching}
          provider={provider}
          onClickRow={(row) => {
            setSelectedRow(row)
          }}
          totalPages={draftPayments?.totalPages}
          onClickEmptyDataCta={onClickEmptyDataCta}
          isFiltered={filterStatuses?.providerStatuses || search}
        />
      </View.Content>
      <SideModal
        title={
          selectedRow && (
            <div className="flex flex-row items-center">
              {selectedRow?.status === PaymentStatus.INVALID && (
                <div className="mr-2 flex items-center">
                  <Image src={AlertIcon} width={16} height={16} />
                </div>
              )}
              <ProfileInfoDisplay.Avatar name={selectedRow?.destinationMetadata?.id && selectedRow?.destinationName} />
              <Typography
                variant="body1"
                classNames="ml-2 max-w-[160px] truncate"
                styleVariant="semibold"
                color="black"
              >
                {selectedRow?.destinationName || 'Unknown'}
              </Typography>
              <DividerVertical height="h-[20px]" />
              {selectedRow?.executedAt && (
                <Typography variant="caption" color="tertiary" styleVariant="regular">
                  Executed on {format(new Date(selectedRow.executedAt), 'dd MMM yyyy')}
                </Typography>
              )}
            </div>
          )
        }
        modalWidth="w-[500px]"
        titleClassName="border-b-0"
        showModal={Boolean(selectedRow)}
        setShowModal={setSelectedRow}
        onClose={() => setSelectedRow(null)}
        data={selectedRow}
        renderActionButtons={false}
        // primaryCTA={actionHandler}
      >
        <PaymentDetail
          selectedData={selectedRow}
          settings={settings}
          verifiedCryptoCurrencyMap={verifiedCryptoCurrencyMap}
        />
      </SideModal>
    </>
  )
}

export default PaymentHistory
