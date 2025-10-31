import { EmptyData } from '@/components-v2/molecules/EmptyData'
import RequestIconLogo from '@/public/svg/logos/request-logo.svg'
import TransactionSection from './TransctionSection'
import { Divider } from '@/components-v2/Divider'
import AdditionalInfo from './AdditionalInfo'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import ExportIcon from '@/public/svg/icons/share-icon.svg'
import Loader from '@/public/svg/Loader.svg'
import useAuth0Service from '@/hooks-v2/useAuth0'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { useRefreshFromSourceMutation } from '@/api-v2/invoices-api'
import { useState, useMemo, useEffect } from 'react'
import ReactTooltip from 'react-tooltip'
import ConnectIcon from '@/public/svg/icons/connect-link-icon.svg'
import { toast } from 'react-toastify'

const InvoiceTab = ({ isConnectedRequest, invoices, isResetData }) => {
  const organizationId = useOrganizationId()
  const [selectedInvoiceNumber, setSelectedInvoiceNumber] = useState<string>(
    invoices?.length ? invoices[0].invoiceNumber : null
  )

  const [refreshFromSource, refreshFromSourceRes] = useRefreshFromSourceMutation()

  const { loginWithRedirect } = useAuth0Service({
    path: '/',
    authO: {
      domain: 'https://auth.request.finance',
      audience: 'accounts',
      clientID: process.env.NEXT_PUBLIC_REQUEST_FINANCE_CLIENTID ?? '',
      redirectUri: `${window.location.origin}/integrations/callback`
    }
  })

  const handleConnectRequest = async () => {
    window.sessionStorage.setItem('organizationId', organizationId)
    loginWithRedirect({ organizationId })
    window.sessionStorage.setItem('integration-type', IntegrationName.REQUEST_FINANCE)
  }

  const hanldeRefresh = (id) => (e) => {
    refreshFromSource({ orgId: organizationId, id })
  }
  const handleChangeInvoice = (option) => {
    setSelectedInvoiceNumber(option.value)
  }

  useEffect(() => {
    if (invoices && invoices.length > 0 && !selectedInvoiceNumber) {
      setSelectedInvoiceNumber(invoices[0].invoiceNumber)
    }
  }, [invoices])

  useEffect(() => {
    if (isResetData) {
      setSelectedInvoiceNumber(null)
    }
  }, [isResetData])

  useEffect(() => {
    if (refreshFromSourceRes?.isSuccess) {
      toast.success('Successfully synced with Request Finance')
    } else if (refreshFromSourceRes?.isError) {
      toast.error('Error syncing with Request Finance')
    }
  }, [refreshFromSourceRes?.isError, refreshFromSourceRes?.isSuccess])

  const invoicesOptions = useMemo(() => {
    if (invoices && invoices?.length) {
      return invoices.map((invoice) => ({
        value: invoice.invoiceNumber,
        label: `Invoice #${invoice.invoiceNumber}`
      }))
    }
    return []
  }, [invoices])

  const selectedInvoice = useMemo(() => {
    if (invoices && invoices?.length) {
      return invoices.find((invoice) => invoice.invoiceNumber === selectedInvoiceNumber)
    }
    return {}
  }, [invoices, selectedInvoiceNumber])

  if (!isConnectedRequest) {
    return (
      <div className="mt-16">
        <EmptyData>
          <EmptyData.Icon icon={ConnectIcon} />
          <EmptyData.Title>Connect with Request</EmptyData.Title>
          <EmptyData.Subtitle>
            Link with your request finance account to
            <br />
            view your invoices here
          </EmptyData.Subtitle>
          <EmptyData.CTA leadingIcon={RequestIconLogo} label="Connect Request" onClick={handleConnectRequest} />
        </EmptyData>
      </div>
    )
  }

  if (invoices && invoices?.length) {
    return (
      <div>
        <div className="flex flex-col gap-8 h-[calc(100vh-248px)] overflow-auto invisible-scrollbar px-1">
          <TransactionSection
            id={selectedInvoice?.id}
            invoiceNumber={selectedInvoiceNumber}
            invoicesOptions={invoicesOptions}
            invoiceItems={selectedInvoice?.invoiceDetails?.items}
            invoiceTotal={selectedInvoice?.totalAmount}
            role={selectedInvoice?.role}
            currency={selectedInvoice?.currency}
            counterParty={{
              email:
                selectedInvoice?.role === 'buyer'
                  ? selectedInvoice?.fromMetadata?.email
                  : selectedInvoice?.toMetadata?.email,
              name:
                selectedInvoice?.role === 'buyer'
                  ? selectedInvoice?.fromMetadata?.name
                  : selectedInvoice?.toMetadata?.name
            }}
            handleChangeInvoice={handleChangeInvoice}
          />
          <AdditionalInfo metadata={selectedInvoice?.metadata || {}} />
        </div>
        <div className="flex gap-8 pt-4">
          <Button
            label={refreshFromSourceRes.isLoading ? '' : 'Update'}
            width="w-full"
            variant="grey"
            data-tip="update-invoice"
            data-for="update-invoice"
            height={48}
            onClick={hanldeRefresh(selectedInvoice?.id)}
            disabled={refreshFromSourceRes.isLoading}
            trailingIcon={
              refreshFromSourceRes.isLoading && <Image src={Loader} width={28} height={28} className="animate-spin" />
            }
          />
          <ReactTooltip
            id="update-invoice"
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            className="!opacity-100 !rounded-lg "
          >
            <p className="text-xs text-neutral-900 font-normal">Sync with Request.</p>
          </ReactTooltip>
          <a
            target="_blank"
            href={selectedInvoice?.viewUrl}
            rel="noopener noreferrer"
            className="bg-black-19 text-white p-3.5 font-inter rounded hover:enabled:bg-indigo-6 hover:enabled:shadow-[0_4px_16px_rgba(29, 41, 57, 0.04)] text-sm tracking-[0.01em] focus:shadow-buttonFocusPurple disabled:grey-900 disabled:opacity-40 disabled:cursor-not-allowed h-[48px] w-full undefined flex items-center gap-2 justify-center"
          >
            <p>View Invoice</p>
            <Image src={ExportIcon} width={14} height={14} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-8 h-[calc(100vh-248px)] overflow-auto invisible-scrollbar px-1">
        <div className="flex justify-center h-[100%]">
          <EmptyData>
            <EmptyData.Icon />
            <EmptyData.Title>No Invoice Found</EmptyData.Title>
            <EmptyData.Subtitle>No invoice found for this transaction</EmptyData.Subtitle>
          </EmptyData>
        </div>
      </div>
      <div className="flex gap-8 pt-4">
        <Button label="Update" width="w-full" variant="grey" height={48} disabled />
        <Button
          label="View Invoice"
          width="w-full"
          variant="black"
          height={48}
          disabled
          trailingIcon={<Image src={ExportIcon} width={14} height={14} />}
        />
      </div>
    </div>
  )
}

export default InvoiceTab
