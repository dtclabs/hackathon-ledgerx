/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState, useRef, useMemo } from 'react'
import Button from '@/components-v2/atoms/Button'
import Image from 'next/legacy/image'
import XeroIcon from '@/public/svg/icons/xero-logo-icon.svg'
import QuickBooksIcon from '@/public/svg/icons/quickbooks-icon.svg'
import GreyCheckIcon from '@/public/svg/icons/grey-check-icon.svg'
import {
  useJournalEntryExportsQuery,
  useDeleteJournalEntryMutation,
  useExportJournalEntryMutation
} from '@/api-v2/financial-tx-api'

import { useOrganizationIntegrationsQuery } from '@/api-v2/merge-rootfi-api'

import { useOrganizationId } from '@/utils/getOrganizationId'
import { EmptyData } from '../EmptyData/EmptyData2'
import Typography from '@/components-v2/atoms/Typography'
import { capitalize } from 'lodash'
import DeleteIcon from '@/public/svg/icons/delete-icon-red.svg'
import { toast } from 'react-toastify'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { Badge2 } from '../Badge'
import LinkIcon from '@/public/svg/icons/link-icon.svg'

import { useRouter } from 'next/router'
import { format } from 'date-fns'
import { useAppDispatch, useAppSelector } from '@/state'
import { api } from '@/api-v2'
import { isMonetisationEnabled, isQuickBooksEnabled } from '@/config-v2/constants'
import { subscriptionPlanSelector } from '@/slice/subscription/subscription-slice'
import { SubscriptionStatus } from '@/api-v2/subscription-api'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { trimAndEllipsis } from '@/utils-v2/string-utils'
import ReactTooltip from 'react-tooltip'

const PROCESS_STATES = ['generating', 'exporting']

const JournalEntryDialogue = ({ accountingIntegration }) => {
  const [journalPolling, setJournalPolling] = useState(5000)
  const organizationId = useOrganizationId()
  const [isOpen, setIsOpen] = useState(false)
  const subscriptionPlan = useAppSelector(subscriptionPlanSelector)

  const { data: organizationIntegration } = useOrganizationIntegrationsQuery(
    {
      organizationId,
      integration: accountingIntegration?.integrationName
    },
    { skip: !organizationId || !accountingIntegration?.integrationName }
  )

  const { data, isLoading, isSuccess, isFetching } = useJournalEntryExportsQuery(
    {
      organizationId,
      params: {
        integrationName: accountingIntegration?.integrationName
      }
    },
    {
      skip: !organizationId || !accountingIntegration?.integrationName,
      pollingInterval: journalPolling
    }
  )

  const dispatch = useAppDispatch()

  const [triggerDeleteJournalEntry, deleteJournalEntryApi] = useDeleteJournalEntryMutation()
  const [triggerExportJournalEntry, exportJournalEntryApi] = useExportJournalEntryMutation()

  const wrapperRef = useRef(null)
  const router = useRouter()

  useOutsideClick(wrapperRef, () => setIsOpen(false))

  const toggleDialog = () => {
    setIsOpen(!isOpen)
  }

  const redirectToGenerate = () => {
    router.push(`/${organizationId}/transactions?generate=true`)
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (isSuccess) {
      const isAllEndState = data?.filter((item) => PROCESS_STATES.includes(item?.status))
      if (isAllEndState?.length > 0) {
        setJournalPolling(5000)
      } else {
        setJournalPolling(0)
        // dispatch(setIsExportedFinish(true))
        dispatch(api.util.invalidateTags(['transactions']))
      }
    } else {
      setJournalPolling(0)
      // dispatch(setIsExportedFinish(true))
      dispatch(api.util.invalidateTags(['transactions']))
    }
  }, [isSuccess, isLoading, isFetching])

  useEffect(() => {
    if (deleteJournalEntryApi.isSuccess) {
      toast.success('Successfully deleted journal entry')
    } else if (deleteJournalEntryApi.isError) {
      toast.error(deleteJournalEntryApi.error?.data?.message ?? 'Error deleting journal entry')
    }
  }, [deleteJournalEntryApi])

  useEffect(() => {
    if (exportJournalEntryApi.isSuccess) {
      toast.success(
        `Processing your ${
          accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'
        } export`
      )
    } else if (exportJournalEntryApi.isError) {
      toast.error(exportJournalEntryApi.error?.data?.message ?? 'Error exporting journal entry')
    }
  }, [exportJournalEntryApi])

  const deleteJournalEntry = (_id) => {
    triggerDeleteJournalEntry({ organizationId, id: _id })
  }

  const onClickExportEntry = (_id) => {
    triggerExportJournalEntry({ organizationId, id: _id })
  }

  const integrationName = useMemo(
    () => (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'),
    [accountingIntegration]
  )

  const companyName = useMemo(
    () =>
      organizationIntegration?.metadata?.companyName?.length > 20
        ? trimAndEllipsis(organizationIntegration?.metadata?.companyName, 15)
        : organizationIntegration?.metadata?.companyName,
    [organizationIntegration?.metadata?.companyName]
  )

  return (
    <div className="relative" ref={wrapperRef}>
      {isMonetisationEnabled && subscriptionPlan?.status !== SubscriptionStatus.EXPIRED && (
        <Button
          leadingIcon={
            <Image
              src={accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroIcon}
              alt="Integration Logo"
              height={20}
              width={20}
            />
          }
          variant="ghost"
          height={52}
          label={`${integrationName} Exports`}
          onClick={toggleDialog}
        />
      )}

      {isOpen && (
        <div className="absolute right-0" style={{ zIndex: 100 }}>
          <div className="bg-white w-[600px] max-h-[400px] overflow-auto shadow-md drop-shadow rounded-lg mt-2 scrollbar">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <Typography variant="heading3" classNames="mb-1 whitespace-nowrap">
                  {`${integrationName} Exports`}
                </Typography>
                <div data-tip="export-modal-badge-tooltip" data-for="export-modal-badge-tooltip">
                  <Badge2 variant="rounded" color="success">
                    <Badge2.Icon icon={LinkIcon} />
                    <Badge2.Label noWrap>
                      Connected to {integrationName}: {companyName || `${integrationName} Account`}
                    </Badge2.Label>
                  </Badge2>
                </div>
              </div>

              <Typography variant="caption" color="secondary">
                You will have to export to {integrationName} before we start processing the next batch of journal
                entries.
              </Typography>
            </div>

            {!data && (
              <div className=" pb-20 px-8">
                <EmptyData>
                  <EmptyData.Icon />
                  <EmptyData.Title>You are all caught up!</EmptyData.Title>
                  <EmptyData.Subtitle>
                    Up to 5 batch of generated journal entries will appear here and will be ready to export to{' '}
                    {integrationName}.
                  </EmptyData.Subtitle>
                  <EmptyData.CTA onClick={redirectToGenerate} label="Generate Now" />
                </EmptyData>
              </div>
            )}
            {data?.length > 0 && (
              <div className="-mt-6">
                {data?.map((entry, index) => (
                  <JournalEntryItem
                    key={index}
                    index={index}
                    accountingIntegration={accountingIntegration}
                    onClickExportEntry={onClickExportEntry}
                    onClickDeleteEntry={deleteJournalEntry}
                    {...entry}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && organizationIntegration?.metadata?.companyName?.length > 20 && (
        <ReactTooltip
          id="export-modal-badge-tooltip"
          borderColor="#eaeaec"
          border
          backgroundColor="white"
          textColor="#111111"
          effect="solid"
          place="bottom"
          className="max-w-[250px] !px-[10px]"
        >
          <Typography variant="caption">{organizationIntegration?.metadata?.companyName}</Typography>
        </ReactTooltip>
      )}
    </div>
  )
}

const JournalEntryItem = ({
  id,
  name,
  key,
  index,
  status,
  onClickDeleteEntry,
  generatedAt,
  onClickExportEntry,
  generatedSuccessfulCount,
  generatedFailedCount,
  completedAt,
  updatedAt,
  exportedSuccessfulCount,
  exportedFailedCount,
  accountingIntegration
}) => {
  const handleDeleteEntry = () => {
    onClickDeleteEntry(id)
  }

  const handleExportEntry = () => {
    onClickExportEntry(id)
  }

  return (
    <div className={`flex flex-row px-6 py-[24px] ${index !== 0 ? 'bg-[#FBFAFA]' : ''}`}>
      <div>
        <div
          style={{
            borderRadius: '50%',
            border: '1px solid #EAECF0',
            height: 45,
            width: 45,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Image
            src={accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? QuickBooksIcon : XeroIcon}
            alt="Integration Logo"
            height={20}
            width={20}
          />
        </div>
      </div>
      <div className="pl-6 flex-1">
        <Typography variant="body2">{capitalize(name)}</Typography>

        <Typography variant="caption" color="secondary" classNames="pt-1">
          Generated on: {format(new Date(generatedAt), 'dd/MM/yyyy')}
        </Typography>
        <Typography variant="caption" color="secondary">
          Generated - Success: {generatedSuccessfulCount} /{' '}
          <span className={generatedFailedCount > 0 && 'text-error-500'}>Failed: {generatedFailedCount}</span>
        </Typography>
        <Typography classNames="pt-1" variant="caption" color="secondary">
          {status === 'aborted' && `Cancelled on: ${format(new Date(updatedAt), 'dd/MM/yyyy')}`}
          {status === 'completed' && `Exported on: ${format(new Date(completedAt), 'dd/MM/yyyy')}`}
        </Typography>
        {(status === 'exporting' || status === 'completed') && (
          <Typography variant="caption" color="secondary">
            Exported - Success: {exportedSuccessfulCount} /{' '}
            <span className={exportedFailedCount > 0 && 'text-error-500'}>Failed: {exportedFailedCount}</span>
          </Typography>
        )}
      </div>
      <div className="basis-2/5 h-[100%] justify-center">
        <div className="flex h-[100%] items-center justify-end">
          {status === 'generated_failed' && (
            <div className="flex items-center flex-row gap-3">
              <Typography variant="caption" color="error">
                Failed
              </Typography>
              <Button
                onClick={handleDeleteEntry}
                variant="ghost"
                height={32}
                label=""
                leadingIcon={<Image src={DeleteIcon} />}
              />
            </div>
          )}
          {(status === 'generating' || status === 'exporting') && (
            <Typography variant="caption" color="secondary">
              {capitalize(status)}
            </Typography>
          )}
          {status === 'generated' && (
            <div className="flex flex-row gap-2">
              <Button onClick={handleExportEntry} variant="black" height={32} label="Export" />
              <Button
                onClick={handleDeleteEntry}
                variant="ghost"
                height={32}
                label=""
                leadingIcon={<Image src={DeleteIcon} />}
              />
            </div>
          )}
          {status === 'aborted' && (
            <Typography color="error" variant="caption">
              Cancelled
            </Typography>
          )}
          {status === 'completed' && (
            <div className="flex flex-row gap-2">
              <Image src={GreyCheckIcon} height={10} width={10} />
              <Typography color="secondary" variant="caption">
                {exportedFailedCount || generatedFailedCount
                  ? `Exported ${exportedSuccessfulCount}/${generatedFailedCount + generatedSuccessfulCount}`
                  : 'Exported'}
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default JournalEntryDialogue
