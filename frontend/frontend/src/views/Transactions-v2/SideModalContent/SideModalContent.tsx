/* eslint-disable no-unneeded-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { toShort } from '@/utils/toShort'
import Image from 'next/legacy/image'
import { useEffect, useState, useMemo } from 'react'
import ArrowRight from '@/public/svg/ArrowRightGrey.svg'
import TabItem from '@/components/TabsComponent/TabItem'
import Tabs from '@/components/TabsComponent/Tabs'
import { capitalize } from 'lodash'
import InfoTab from './InfoTab'
import FileTabs from './FilesTab'
import { SVGIcon } from '@/components/SVGs/SVGIcon'
import { handleCopyMessage, handleOnClickExternal } from '../TxGridTable/TxGridTableRow'
import SignersTab from './SignersTab/SignersTab'
import InvoiceTab from './InvoiceTab'
import TextField from '@/components/TextField/TextField'
import {
  useUpdateParentFinancialTransactionMutation,
  useGetFinancialTransactionTaxLotsQuery,
  useLazyGetFinancialTransactionDefaultMappingQuery
} from '@/api-v2/financial-tx-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toast } from 'react-toastify'
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { supportedChainsSelector } from '@/slice/chains/chains-slice'
import { useAppSelector } from '@/state'
import { getDefaultMappingOptions } from '../TxGridTable/txGrid.utils'
import ActivityLogTab from './ActivityLogTab'

const SideModalContent = ({
  displayParent,
  setDisplayParent,
  onClickChildTx,
  data,
  files,
  resetTab,
  chartOfAccounts,
  selectedItem,
  isLoading = true,
  isResetData,
  isConnectedRequest,
  tagsHandler,
  tags
}) => {
  const orgId = useOrganizationId()
  const [activeTab, setActiveTab] = useState<string>('info')
  const [editedRemark, setEditedRemark] = useState<string>(data?.remark)
  const { data: taxLots } = useGetFinancialTransactionTaxLotsQuery(
    { orgId, id: selectedItem?.id },
    { skip: !selectedItem?.id }
  )
  const [getDefaultMapping, { data: defaultMapping }] = useLazyGetFinancialTransactionDefaultMappingQuery()

  const [updateParent, updateParentApi] = useUpdateParentFinancialTransactionMutation()
  const supportedChains = useAppSelector(supportedChainsSelector)

  const handleSave = () => {
    updateParent({
      orgId,
      id: selectedItem.id,
      parentHash: selectedItem.hash,
      body: {
        remark: editedRemark
      }
    })
  }
  useEffect(() => {
    if (!selectedItem) {
      setDisplayParent(false)
    }
  }, [selectedItem])

  useEffect(() => {
    if (data?.remark) {
      setEditedRemark(data?.remark)
    } else {
      setEditedRemark('')
    }
  }, [data?.remark])

  useEffect(() => {
    if (selectedItem) {
      getDefaultMapping({ id: selectedItem.id, orgId })
    }
  }, [selectedItem])

  const chartOfAccountsOptions = useMemo(
    () => getDefaultMappingOptions(chartOfAccounts, defaultMapping),
    [defaultMapping, chartOfAccounts]
  )

  useEffect(() => {
    if (updateParentApi.isSuccess) {
      toast.success('Remark saved')
    } else if (updateParentApi.isError) {
      toast.error('Remark save failed')
    }
  }, [updateParentApi.isError, updateParentApi.isSuccess])

  const detailTabs = useMemo(
    () => [
      {
        key: 'info',
        name: 'Info',
        active: true
      },
      {
        key: 'files',
        name: 'Files & Notes',
        active: false
      },
      {
        key: 'signers',
        name: 'Signers',
        active: false,
        count: selectedItem?.gnosisMetadata?.confirmationsRequired ?? 0,
        disabled: !selectedItem?.gnosisMetadata
      },
      {
        key: 'invoices',
        name: 'Invoices',
        active: false
      },
      {
        key: 'activity-log',
        name: 'Activity Log',
        active: false
      }
    ],
    [selectedItem?.gnosisMetadata]
  )

  useEffect(() => {
    if (resetTab) {
      setActiveTab('info')
    }
  }, [resetTab])

  const handleOnClickChildTx = (_item) => () => {
    onClickChildTx(_item)
    setDisplayParent(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Typography>Loading</Typography>
      </div>
    )
  }

  if (displayParent) {
    return (
      <>
        <Typography variant="body1" classNames="!text-[#344054]">
          Summary
        </Typography>
        <div className="flex flex-row justify-between mt-6">
          <Typography variant="body2" classNames="!text-[#667085]">
            Activity
          </Typography>
          <Typography variant="body2" classNames="!text-[#667085]">
            {capitalize(data?.activity)}
          </Typography>
        </div>
        <div className="flex flex-row justify-between mt-4">
          <Typography variant="body2" classNames="!text-[#667085]">
            Transaction Hash
          </Typography>
          <div className="flex flex-row gap-3">
            <Typography variant="body2" classNames="!text-[#667085]">
              {toShort(data?.hash, 5, 4)}
            </Typography>
            <div className="flex flex-row gap-2">
              <button
                type="button"
                onClick={handleOnClickExternal(
                  data?.hash,
                  supportedChains?.find((chain) => chain.id === selectedItem?.blockchainId)?.blockExplorer
                )}
              >
                <SVGIcon name="ExternalLinkIcon" width={14} height={14} />
              </button>
              <button type="button" onClick={handleCopyMessage(data?.hash)}>
                <SVGIcon name="CopyIcon" width={14} height={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8" style={{ borderBottom: '1px solid #E2E2E0' }} />
        <div>
          <Typography classNames="mt-6 pb-2 !text-[#344054]" variant="body1">
            Transfers
          </Typography>
          <div className="overflow-auto scrollbar max-h-[calc(100vh-471px)]">
            {data?.financialTransactions &&
              data?.financialTransactions?.map((item) => (
                <div
                  className="flex flex-row items-center justify-between cursor-pointer"
                  style={{ borderBottom: '1px solid #E2E2E0' }}
                  onClick={handleOnClickChildTx(item)}
                >
                  <div className="mt-4 pb-4 pl-4 flex flex-row items-center gap-3">
                    <Typography classNames="!text-[#344054]" variant="body2">
                      {capitalize(item.type === 'internal_transfer' ? 'Internal Transfer' : item.type)}
                    </Typography>
                    <img alt="" src={item.cryptocurrency?.image?.small} width={25} />

                    <Typography color={item?.direction === 'outgoing' ? 'error' : 'success'}>
                      {item.cryptocurrencyAmount} {item.cryptocurrency.symbol}
                    </Typography>
                  </div>
                  <div>
                    <Image src={ArrowRight} />
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className=" mb-4 pt-3" style={{ borderTop: '1px solid #E2E2E0' }}>
          <div className="flex items-center justify-between mb-2 mt-4 h-[30px] ">
            <div className="pb-2">
              <Typography classNames="p-2 pb-0 pl-0" variant="body1" styleVariant="semibold" color="dark">
                Remark
              </Typography>

              <Typography classNames="!text-[10px] !text-secondary">
                This will be used as the Narration if synced to Xero as Journal Entries
              </Typography>
            </div>
            <Button
              height={24}
              variant="whiteWithBlackBorder"
              label="Save"
              classNames="!text-xs"
              onClick={() => {
                handleSave()
              }}
            />
          </div>
          <div className="h-[60px]">
            <TextField
              name="remark"
              value={editedRemark ?? data?.remark}
              onChangeTextArea={(e) => {
                setEditedRemark(e.target.value)
              }}
              multiline
              rows={3}
              classNameInput="focus:outline-none scrollbar border border-[#EAECF0] px-2 py-2 text-sm text-dash placeholder:text-[#98A2B3] placeholder:leading-5 w-full font-inter rounded-lg disabled:bg-transparent focus:shadow-textFieldRecipient"
            />
          </div>
        </div>
      </>
    )
  }

  return (
    <Tabs
      setActive={setActiveTab}
      active={activeTab}
      tabs={detailTabs}
      activeStyle="bg-grey-200 font-semibold"
      wrapperClassName="border-b pb-2"
      className="gap-2"
      classNameBtn="flex items-center justify-center font-inter text-grey-800 text-sm rounded-lg p-2"
    >
      <TabItem key="info">
        <InfoTab
          taxlots={taxLots}
          selectedItem={selectedItem}
          chartOfAccounts={chartOfAccountsOptions}
          tagsHandler={tagsHandler}
          tags={tags}
        />
      </TabItem>
      <TabItem key="files">
        <FileTabs selectedItem={selectedItem} files={files} resetError={resetTab} activeTab={activeTab} />
      </TabItem>
      <TabItem key="signers">
        <SignersTab data={selectedItem?.gnosisMetadata} />
      </TabItem>
      <TabItem key="invoices">
        <InvoiceTab
          invoices={selectedItem?.financialTransactionParent?.invoices || []}
          isConnectedRequest={isConnectedRequest}
          isResetData={isResetData}
        />
      </TabItem>
      <TabItem key="activity-log">
        <ActivityLogTab data={selectedItem?.paymentMetadata} />
      </TabItem>
    </Tabs>
  )
}

export default SideModalContent
