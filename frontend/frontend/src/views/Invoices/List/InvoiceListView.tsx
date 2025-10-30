/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-else-return */
import { useEffect, useMemo, useState, useRef } from 'react'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { toast } from 'react-toastify'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import InvoiceTableRow from './components/InvoiceTableRow'
import InvoiceTableSkeletonRows from './components/InvoiceTableSkeletonRows'
import { PlanName } from '@/api-v2/subscription-api'
import { useRouter } from 'next/router'
import Image from 'next/legacy/image'
import { isEmpty } from 'lodash'
import ReactTooltip from 'react-tooltip'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useModalHook } from '@/components-v2/molecules/Modals/BaseModal/state-ctx'
import { DeactivateInvoiceModal, InvoiceDetailModal } from '../components'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import LoadingPopUp from '@/components-v2/molecules/LoadingPopUp'
import {
  useGetInvoicesQuery,
  useLazyGetInvoiceQuery,
  useCancelInvoiceMutation,
  useGlobalSyncDtcpayMutation,
  useRefreshFromSourceMutation
} from '@/api-v2/invoices-api'
import { useGetOrganizationIntegrationQuery } from '@/api-v2/organization-integrations'
import DTCPaylogo from '@/public/svg/logos/dtcpay-circle.svg'
import { useAppSelector } from '@/state'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { useGetCryptoCurrenciesQuery, useGetFiatCurrencyByCodeQuery } from '@/api-v2/cryptocurrencies'
import { useTableHook } from '@/components-v2/molecules/Tables/SimpleTable/table-ctx'
import SuccessCreateInvoiceModal from '../components/SuccessCreateInvoiceModal'
import { INVOICE_SESSION_STORAGE } from '../invoice-utils'
import InvoiceListFilter from './components/InvoiceListFilter'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sortByIssuedDate(items) {
  // Sort the items by issuedDate in descending order
  items.sort((a: any, b: any) => {
    // Use optional chaining to safely access the issuedDate property
    const issuedDateA = a?.issueDate
    const issuedDateB = b?.issueDate

    // Handle cases where either issuedDate is null or undefined
    if (issuedDateA === null && issuedDateB === null) {
      return 0
    } else if (issuedDateA === null) {
      return 1
    } else if (issuedDateB === null) {
      return -1
    }

    // Compare the issuedDate values (assumes they are date strings)
    return Number(new Date(issuedDateB).getTime()) - Number(new Date(issuedDateA).getTime())
  })

  return items
}

const columns = [
  {
    Header: '',
    accessor: 'img'
  },
  {
    Header: 'Invoice',
    accessor: 'invoice'
  },
  {
    Header: 'Issued Date',
    accessor: 'issueDate'
  },
  {
    Header: 'Due Date',
    accessor: 'dueDate'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Invoice Status',
    accessor: 'invoiceStatus'
  },
  {
    Header: 'Settlement Status',
    accessor: 'settlementStatus',
    colSpan: 2
  },

  {
    Header: 'Actions',
    accessor: ''
  }
]

const InvoiceListView = () => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  const cancelInvoiceRef = useRef(null)

  const [syncModalData, setSyncModalData] = useState<{ title: string; description: string }>({
    title: '',
    description: ''
  })
  const [filter, setFilter] = useState({})
  const showBanner = useAppSelector(showBannerSelector)
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const provider = useTableHook({})
  const { data: cryptoCurrencies } = useGetCryptoCurrenciesQuery({})
  const [triggerGetInvoice, getInvoiceApi] = useLazyGetInvoiceQuery()
  const successCreateModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const [triggerCancelInvoice, cancelInvoiceApi] = useCancelInvoiceMutation()
  const [trifferRefreshInvoice, refreshInvoiceApi] = useRefreshFromSourceMutation()
  const [triggerGlobalSyncDtcpay, globalSyncDtcpayResponse] = useGlobalSyncDtcpayMutation()
  const { data: organizationIntegration, error: organizationIntegrationError } = useGetOrganizationIntegrationQuery({
    organizationId,
    integrationName: 'dtcpay'
  })
  const invoiceDetailModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const syncingModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const deactivateInvoiceModalProvider = useModalHook({ defaultState: { isOpen: false } })
  const {
    data: invoices,
    isLoading: isLoadingInvoices,
    isFetching: isFetchingInvoices,
    refetch: refetchInvoices
  } = useGetInvoicesQuery({
    organizationId,
    params: {
      size: 100,
      ...filter
    }
  })

  const onClickCreateInvoice = () => router.push(`/${organizationId}/invoices/create`)
  const onClickRedirectToIntegrations = () => router.push(`/${organizationId}/integrations`)
  const onClickRedirectToPlan = () => router.push(`/${organizationId}/orgsettings?activeTab=pricingAndPlans`)

  useEffect(() => {
    if (getInvoiceApi.isSuccess) {
      setSelectedRow(getInvoiceApi.data?.data)
      refetchInvoices()
    }
  }, [getInvoiceApi])

  useEffect(() => {
    if (window.sessionStorage.getItem(INVOICE_SESSION_STORAGE.CREATED)) {
      successCreateModalProvider.methods.setIsOpen(true)
    }
  }, [])

  const mappedTokens = useMemo(() => {
    if (!cryptoCurrencies?.data?.length) return []
    return cryptoCurrencies?.data?.map((token) => ({
      label: token?.name,
      value: token?.symbol,
      image: token?.image?.small
    }))
  }, [cryptoCurrencies])

  useEffect(() => {
    if (globalSyncDtcpayResponse.isSuccess) {
      sleep(3500).then(() => {
        syncingModalProvider.methods.setIsOpen(false)
      })
    } else if (globalSyncDtcpayResponse.isError) {
      syncingModalProvider.methods.setIsOpen(false)
      toast.error(globalSyncDtcpayResponse?.error?.data?.message || 'Sorry, an error while syncing with dtcpay', {
        position: 'top-right',
        pauseOnHover: false
      })
    }
  }, [globalSyncDtcpayResponse])

  useEffect(() => {
    if (refreshInvoiceApi.isSuccess) {
      sleep(3500).then(() => {
        syncingModalProvider.methods.setIsOpen(false)
        toast.success("Invoice successfully updated with dtcpay's latest data")
      })
    } else if (refreshInvoiceApi.isError) {
      syncingModalProvider.methods.setIsOpen(false)
      toast.error(refreshInvoiceApi?.error?.data?.message || 'Sorry, an error while syncing with dtcpay', {
        position: 'top-right',
        pauseOnHover: false
      })
    }
  }, [refreshInvoiceApi])

  useEffect(() => {
    if (cancelInvoiceApi.isSuccess) {
      setSelectedRow(null)
      toast.success('Invoice successfully voided', {
        position: 'top-right',
        pauseOnHover: false
      })
      deactivateInvoiceModalProvider.methods.setIsOpen(false)
    } else if (cancelInvoiceApi.isError) {
      toast.error(cancelInvoiceApi?.error?.data?.message || 'Sorry, an error occured', {
        position: 'top-right',
        pauseOnHover: false
      })
    }
    cancelInvoiceRef.current = null
  }, [cancelInvoiceApi])

  const parsedListData = useMemo(() => {
    const sessionInvoices = (JSON.parse(window.sessionStorage.getItem(INVOICE_SESSION_STORAGE.LIST) || '[]') || []).map(
      (item) => ({
        invoiceNumber: item?.invoiceNumber,
        id: item?.id,
        issueDate: item?.issuedAt,
        dueDate: item?.expiredAt,
        payee: item?.toMetadata?.name,
        totalAmountFiat: item?.totalAmount,
        totalAmountToken: item?.sourceMetadata?.amount,
        cryptocurrencyImage: mappedTokens?.find((token) => token.value === item?.sourceMetadata?.cryptocurrency)?.image,
        cryptocurrencySymbol: item?.sourceMetadata?.cryptocurrency,
        invoiceStatus: item?.status,
        settlementStatus: item?.metadata?.settlementStatus ?? 'pending'
      })
    )

    const apiItems = invoices?.data?.items || []
    const parsedInvoices = apiItems.map((item) => ({
      invoiceNumber: item?.invoiceNumber,
      id: item?.id,
      issueDate: item?.issuedAt,
      dueDate: item?.expiredAt,
      payee: item?.toMetadata?.name,
      totalAmountFiat: item?.totalAmount,
      totalAmountToken: item?.sourceMetadata?.amount,
      cryptocurrencyImage: mappedTokens?.find((token) => token.value === item?.sourceMetadata?.cryptocurrency)?.image,
      cryptocurrencySymbol: item?.sourceMetadata?.cryptocurrency,
      invoiceStatus: item?.status,
      settlementStatus: item?.metadata?.settlementStatus ?? 'pending'
    }))

    const combined = [...sessionInvoices, ...parsedInvoices]
    const sorted = sortByIssuedDate(combined)
    return sorted
  }, [invoices?.data?.items, cryptoCurrencies])

  const handleOnClickCopy = (_value) => {
    const paymentRoute = `${window.location.origin}/payments/dtc/${_value?.id}?organization=${organizationId}`
    navigator.clipboard.writeText(paymentRoute)
    toast.success('Link copied successfully', {
      position: 'top-right',
      pauseOnHover: false
    })
  }

  const handleOpenDeativateModal = (_id) => {
    cancelInvoiceRef.current = _id
    deactivateInvoiceModalProvider.methods.setIsOpen(true)
  }

  const handleOnClickRow = (_row) => {
    const id = _row?.original?.id
    invoiceDetailModalProvider.methods.setIsOpen(true)

    // Prefer sessionStorage data when available
    const sessionList = JSON.parse(window.sessionStorage.getItem(INVOICE_SESSION_STORAGE.LIST) || '[]')
    const found = sessionList.find((inv) => inv.id === id)
    if (found) {
      setSelectedRow(found)
      return
    }

    // Fallback to API fetch
    triggerGetInvoice({
      organizationId,
      id
    })
  }

  const handleDeactivateInvoice = () => {
    triggerCancelInvoice({
      organizationId,
      id: cancelInvoiceRef.current
    })
  }

  const dtcPayIntegrationHandler = useMemo(() => {
    if (
      subscriptionPlan?.planName !== PlanName.FREE_TRIAL &&
      !subscriptionPlan?.organizationIntegrationAddOns?.dtcpay
    ) {
      return {
        label: 'Create New',
        locked: true,
        isIntegrated: false,
        isPartOfPlan: false,
        isDisabled: true,
        onclick: () => null
      }
    }
    if (
      organizationIntegrationError?.status === 404 &&
      organizationIntegrationError?.data?.message === 'Can not find organization integration'
    ) {
      return {
        label: 'Create New',
        locked: false,
        isIntegrated: false,
        isPartOfPlan: subscriptionPlan?.organizationIntegrationAddOns?.dtcpay ?? false,
        isDisabled: true
      }
    }
    return {
      label: 'Create New',
      locked: false,
      isIntegrated: true,
      isPartOfPlan: true,
      isDisabled: false,
      onclick: () => null
    }
  }, [subscriptionPlan, organizationIntegrationError, organizationIntegration])

  const handleCloseDetailModal = () => {
    setSelectedRow(null)
  }

  const calculateTaxType = () => {
    if (selectedRow) {
      const invoiceTotal = selectedRow.totalAmount
      const subTotal = selectedRow.invoiceDetails?.subtotal
      const taxTotal = selectedRow.invoiceDetails?.taxTotal
      if (parseFloat(taxTotal) === 0) {
        return 'none'
      } else if (invoiceTotal === subTotal) {
        return 'inclusive'
      } else {
        return 'exclusive'
      }
    }
    return ''
  }

  const handleOnSuccessInvoiceClosed = () => {
    successCreateModalProvider.methods.setIsOpen(false)
    window.sessionStorage.removeItem(INVOICE_SESSION_STORAGE.CREATED)
    window.sessionStorage.removeItem(INVOICE_SESSION_STORAGE.CREATED_INVOICE_NUMBER)
  }

  const onClickSyncInvoices = () => {
    setSyncModalData({
      title: 'Syncing invoices from dtcpay',
      description: 'Fetching latest dtcpay invoice data...'
    })
    syncingModalProvider.methods.setIsOpen(true)
    triggerGlobalSyncDtcpay({
      organizationId
    })
  }

  const handleSyncInvoice = (_id, _invoiceNumber) => {
    setSyncModalData({
      title: 'Updating invoice from dtcpay',
      description: `Fetching latest invoice ${_invoiceNumber}...`
    })
    syncingModalProvider.methods.setIsOpen(true)
    trifferRefreshInvoice({
      orgId: organizationId,
      id: _id
    })
  }

  const renderCryptoCurrencyImage = () => {
    const selectedCryptoCurrency = cryptoCurrencies?.data?.find(
      (item) => item.symbol === organizationIntegration?.metadata?.currency
    )
    if (!selectedCryptoCurrency) return ''

    return selectedCryptoCurrency?.image?.small
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      <Header>
        <Header.Left>
          <Header.Left.Title>Invoices</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          <Header.Right.SecondaryCTA
            leadingIcon={<Image src={DTCPaylogo} className="rounded-full" alt="dtc-logo" height={16} width={16} />}
            data-tip="disabled-create-invoice"
            data-for="disabled-create-invoice"
            disabled={dtcPayIntegrationHandler.isDisabled || globalSyncDtcpayResponse.isLoading}
            onClick={onClickSyncInvoices}
            label="Sync"
          />
          <Header.Right.PrimaryCTA
            locked={dtcPayIntegrationHandler.locked}
            data-tip="disabled-create-invoice"
            data-for="disabled-create-invoice"
            disabled={dtcPayIntegrationHandler.isDisabled}
            onClick={onClickCreateInvoice}
            label="Create New"
          />
          {dtcPayIntegrationHandler.isDisabled && (
            <ReactTooltip
              id="disabled-create-invoice"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg"
            >
              {dtcPayIntegrationHandler.isPartOfPlan
                ? 'Require connection to dtcpay. You may do so under Integrations.'
                : 'Please buy Business or above plan to access this feature.'}
            </ReactTooltip>
          )}
        </Header.Right>
      </Header>

      <View.Content>
        <div className="mt-4">
          <InvoiceListFilter filter={filter} setFilter={setFilter} />
        </div>
        <div style={{ minWidth: 1200 }}>
          <SimpleTable
            columns={columns}
            provider={provider}
            data={parsedListData}
            isLoading={isLoadingInvoices}
            defaultPageSize={10}
            pagination
            onClickRow={(_row) => handleOnClickRow(_row)}
            tableHeight={`${showBanner ? 'h-[calc(100vh-170px)]' : 'h-[calc(100vh-170px)]'}`}
            noData={
              isLoadingInvoices ? (
                <InvoiceTableSkeletonRows emptyRows={10} />
              ) : !dtcPayIntegrationHandler.isPartOfPlan ? (
                <EmptyData>
                  <EmptyData.Icon icon={DTCPaylogo} extendedClass="rounded-full" />
                  <EmptyData.Title>dtcpay is not part of your plan</EmptyData.Title>
                  <EmptyData.Subtitle>Please upgrade to integrate your dtcpay account</EmptyData.Subtitle>
                  <EmptyData.CTA label="See Plans" onClick={onClickRedirectToPlan} />
                </EmptyData>
              ) : !dtcPayIntegrationHandler.isIntegrated ? (
                <EmptyData>
                  <EmptyData.Icon icon={DTCPaylogo} extendedClass="rounded-full" />
                  <EmptyData.Title>dtcpay integration is required</EmptyData.Title>
                  <EmptyData.Subtitle>Please integrate your dtcpay account to create an invoice</EmptyData.Subtitle>
                  <EmptyData.CTA label="Integrate dtcpay" onClick={onClickRedirectToIntegrations} />
                </EmptyData>
              ) : parsedListData?.length === 0 && !isEmpty(filter) ? (
                <div className="p-8 flex justify-center">
                  <EmptyData>
                    <EmptyData.Icon />
                    <EmptyData.Title>No Invoices found</EmptyData.Title>
                    <EmptyData.Subtitle>Please ensure you're searching for the right invoice</EmptyData.Subtitle>
                  </EmptyData>
                </div>
              ) : (
                <div className="p-8 flex justify-center">
                  <EmptyData>
                    <EmptyData.Icon />
                    <EmptyData.Title>Don’t see any invoices yet?</EmptyData.Title>
                    <EmptyData.Subtitle>Create an invoice link and start collecting payments</EmptyData.Subtitle>
                    <EmptyData.CTA label="Create Invoice" onClick={onClickCreateInvoice} />
                  </EmptyData>
                </div>
              )
            }
            renderRow={(row) => (
              <InvoiceTableRow
                onClickDeactivate={handleOpenDeativateModal}
                onClickSync={handleSyncInvoice}
                data={row}
                onClickCopyButton={handleOnClickCopy}
                currency={organizationIntegration?.metadata?.currency ?? 'SGD'}
              />
            )}
          />
        </div>

        <InvoiceDetailModal
          countryIso="SG"
          taxType={calculateTaxType()}
          isLoading={getInvoiceApi.isLoading || getInvoiceApi.isFetching}
          onClose={handleCloseDetailModal}
          fiatCurrencySetting={{
            currencyCode: organizationIntegration?.metadata?.currency ?? 'SGD',
            currencyCategory: organizationIntegration?.metadata?.currencyCategory ?? 'fiat',
            currencyImage: renderCryptoCurrencyImage() ?? ''
          }}
          data={
            (selectedRow || getInvoiceApi?.data?.data) && {
              ...(selectedRow || getInvoiceApi?.data?.data),
              invoiceDetails: {
                subtotal: (selectedRow || getInvoiceApi?.data?.data)?.invoiceDetails?.subtotal,
                taxTotal: (selectedRow || getInvoiceApi?.data?.data)?.invoiceDetails?.taxTotal,
                items:
                  (selectedRow || getInvoiceApi?.data?.data)?.invoiceDetails?.items ||
                  ((selectedRow || getInvoiceApi?.data?.data)?.sourceMetadata?.items ?? [])
              }
            }
          }
          provider={invoiceDetailModalProvider}
        />
        <DeactivateInvoiceModal
          isLoading={cancelInvoiceApi.isLoading}
          handleOnConfirm={handleDeactivateInvoice}
          provider={deactivateInvoiceModalProvider}
        />
        <SuccessCreateInvoiceModal
          handleOnClose={handleOnSuccessInvoiceClosed}
          provider={successCreateModalProvider}
          invoiceNumber={window.sessionStorage.getItem(INVOICE_SESSION_STORAGE.CREATED_INVOICE_NUMBER)}
          invoiceUrl={`${window.location.origin}/payments/dtc/${window.sessionStorage.getItem(
            INVOICE_SESSION_STORAGE.CREATED
          )}?organization=${organizationId}`}
        />
        <LoadingPopUp
          title={syncModalData.title}
          decription={syncModalData.description}
          provider={syncingModalProvider}
        />
      </View.Content>
    </div>
  )
}

export default InvoiceListView
