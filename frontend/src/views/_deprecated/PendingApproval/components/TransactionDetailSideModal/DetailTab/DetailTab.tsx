/* eslint-disable react/no-array-index-key */
/* eslint-disable prefer-destructuring */
import { FC } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { format } from 'date-fns'
import { uniqueId } from 'lodash'
import { useAppSelector } from '@/state'
import { MultipleCryptoAmountInfoDisplay } from '@/components-v2/molecules/MultipleCryptoAmountInfoDisplay'
import { FiatCurrencyDisplay } from '@/components-v2/molecules/FiatCurrencyDisplay'
import { WalletAddressCopy } from '@/components-v2/molecules/WalletAddressCopy'
import { SimpleTable } from '@/components-v2/molecules/Tables/SimpleTable'
import { EmptyData } from '@/components-v2/molecules/EmptyData'
import { Divider } from '@/components-v2/Divider'
import RecipientItemRowItem from './RecipientItemRowItem'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { selectedChainSelector } from '@/slice/platform/platform-slice'
import { Alert } from '@/components-v2/molecules/Alert'
import TransactionActionButtons from '../../TransactionactionButtons'
import { selectChainIconByName } from '@/slice/chains/chain-selectors'
import Image from 'next/legacy/image'
import PopupDialog from '@/views/MakePayment2/components/PopupDialog'
import { useLazyDownloadTxFileQuery, useLazyPreviewFileQuery } from '@/api-v2/old-tx-api'
import { toNearestDecimal } from '@/utils-v2/numToWord'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'

const columns = [
  {
    Header: 'Recipient',
    accessor: 'recipient'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Account',
    accessor: 'account'
  },
  {
    Header: 'Notes',
    accessor: 'notes'
  },
  {
    Header: 'Files',
    accessor: 'files'
  }
]

interface IDetailTabProps {
  transaction: any
  onClickRejectTransaction: (data: any, e: any) => void
  onClickApproveTransaction: (data: any, e: any) => void
  onClickExecuteRejection: (data: any, e: any) => void
  onClickExecuteTransaction: (data: any, e: any) => void
  onAddContact: (address: string) => void
  isParsingTransactionOwnership: boolean
}

const DetailTab: FC<IDetailTabProps> = ({
  transaction,
  onClickRejectTransaction,
  onClickApproveTransaction,
  onClickExecuteRejection,
  onClickExecuteTransaction,
  onAddContact,
  isParsingTransactionOwnership
}) => {
  const selectedChain = useAppSelector(selectedChainSelector)
  const { country: countrySetting } = useAppSelector(orgSettingsSelector)

  const [triggerDownload] = useLazyDownloadTxFileQuery()
  const [triggerPreviewFile] = useLazyPreviewFileQuery()

  const handleOnClickFile = (file) => {
    triggerPreviewFile({
      filename: file.name,
      key: file.filename
    })
  }
  const handleOnDownloadFile = (file) => {
    triggerDownload({
      filename: file.name,
      key: file.filename
    })
  }

  const SourceSafeChainIcon = useAppSelector((state) => selectChainIconByName(state, transaction?.blockchainId))

  const aggregateTotals = transaction?.recipients.reduce((acc, recipient) => {
    const { cryptocurrencyAmount, fiatAmount, cryptocurrency } = recipient
    const amount = parseFloat(cryptocurrencyAmount)
    const fiat = parseFloat(fiatAmount)
    const symbol = cryptocurrency.symbol
    const image = cryptocurrency.image.large // Assuming we want the large image

    if (acc[symbol]) {
      acc[symbol].cryptocurrencyAmountTotal += amount
      acc[symbol].fiatAmountTotal += fiat
    } else {
      acc[symbol] = {
        symbol,
        cryptocurrencyAmountTotal: amount,
        fiatAmountTotal: fiat,
        cryptocurrencyImage: image
      }
    }

    return acc
  }, {})

  return (
    <div className={`mt-6 h-[calc(100vh-160px)] flex flex-col ${transaction?.isRejected ? '' : 'justify-between'}`}>
      {transaction?.isRejected && (
        <div className="pb-6">
          <Alert isVisible variant="warning">
            <Alert.Text extendedClass="text-center">
              You will still need to execute this transaction to prevent it from holding up your transaction queue.
            </Alert.Text>
          </Alert>
        </div>
      )}
      <section id="info" className="flex flex-col">
        <section id="safe-hash" className="flex flex-row justify-between items-center mb-4">
          <Typography variant="body2" styleVariant="semibold" color="secondary">
            Safe Transaction Hash
          </Typography>
          <WalletAddressCopy styleVariant="semibold" color="primary" split={8} address={transaction?.safeHash}>
            <WalletAddressCopy.Copy address={transaction?.safeHash} />
          </WalletAddressCopy>
        </section>
        <section id="submit-data" className="flex flex-row justify-between items-center -mb-2">
          <Typography variant="body2" styleVariant="semibold" color="secondary">
            Date of Submitting Transfer
          </Typography>
          <Typography styleVariant="semibold" variant="body2">
            {format(new Date(transaction?.submissionDate), 'dd MMM yyyy, h:mm:ss a')}
          </Typography>
        </section>
        <Divider />
        <section id="source-fund" className="flex flex-row justify-between items-center mt-2 -mb-2">
          <Typography variant="body2" styleVariant="semibold" color="secondary">
            Paying From
          </Typography>
          <div className="flex flex-row gap-2">
            <Typography styleVariant="semibold" variant="body2">
              {transaction?.wallet?.name}
            </Typography>
            <WalletAddressCopy color="secondary" split={8} address={transaction?.wallet?.address}>
              <WalletAddressCopy.Copy address={transaction?.wallet?.address} />
            </WalletAddressCopy>
            <Image src={SourceSafeChainIcon} alt="chain-image" height={16} width={16} />
          </div>
        </section>
        <Divider />
        <section id="recipients">
          <div className="flex flex-row justify-between items-center mb-4">
            <Typography variant="body2" styleVariant="semibold" color="secondary">
              Paying To
            </Typography>
            {!transaction?.isRejected && (
              <div className="flex flex-row gap-2 items-center">
                <Typography variant="body2">
                  {transaction?.recipients?.length} Recipient
                  {transaction?.recipients?.length > 1 ? 's' : ''}
                </Typography>
                <DividerVertical />
                {Object.values(aggregateTotals)
                  ?.slice(0, 2)
                  ?.map((amountObj: any, _index) => (
                    <div key={_index} className="flex gap-1">
                      <Image src={amountObj.cryptocurrencyImage} width={16} height={16} className="flex-shrink-0" />
                      <Typography variant="body2" styleVariant="semibold">
                        {toNearestDecimal(amountObj?.cryptocurrencyAmountTotal?.toString(), countrySetting?.iso, 18) ??
                          'N/A'}
                      </Typography>
                    </div>
                  ))}
                <PopupDialog
                  placement="below"
                  width="250px"
                  trigger={
                    <Typography styleVariant="semibold" classNames="cursor-pointer underline">
                      View Full Summary
                    </Typography>
                  }
                >
                  <div>
                    <div className="flex flex-col  " data-tip="asset-grid" data-for="asset-grid">
                      {Object.values(aggregateTotals)?.map((amountObj: any, _index) => (
                        <div key={_index} className="mb-3">
                          <div className="flex gap-2 items-center ">
                            <Image src={amountObj.cryptocurrencyImage} width={16} height={16} />
                            <Typography variant="body2" classNames="-ml-1" styleVariant="semibold">
                              {toNearestDecimal(
                                amountObj?.cryptocurrencyAmountTotal?.toString(),
                                countrySetting?.iso,
                                18
                              ) ?? 'N/A'}
                            </Typography>
                            <Typography variant="body2" styleVariant="semibold">
                              {amountObj?.symbol ?? 'N/A'}
                            </Typography>
                          </div>
                          <Typography variant="caption" color="secondary">
                            ~ {transaction?.fiatCurrencyData?.symbol}
                            {amountObj?.fiatAmountTotal ?? 'N/A'} {transaction?.fiatCurrencyData?.code}
                          </Typography>
                        </div>
                      ))}

                      <div className="-mt-5">
                        <Divider />
                        <div className="flex flex-col gap-2">
                          <Typography variant="caption" color="secondary">
                            Total
                          </Typography>
                          <Typography styleVariant="semibold">
                            ~ {transaction?.fiatCurrencyData?.symbol}
                            {transaction?.fiatTotalAmount?.toFixed(3) ?? 'N/A'} {transaction?.fiatCurrencyData?.code}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </PopupDialog>
                <DividerVertical />{' '}
                <FiatCurrencyDisplay
                  iso={transaction?.fiatCurrencyData?.iso}
                  currencyCode={transaction?.fiatCurrencyData?.code}
                  currencySymbol={transaction?.fiatCurrencyData?.symbol}
                  fiatAmount={String(transaction?.fiatTotalAmount)}
                  styleVariant="semibold"
                />
              </div>
            )}
          </div>
          {transaction?.isRejected ? (
            <div className="mt-6">
              <div className="border border-[#EAECF0] text-center rounded py-2">
                <Typography color="secondary">
                  The transaction was rejected. Recipient data is not available.
                </Typography>
              </div>
            </div>
          ) : (
            <SimpleTable
              columns={columns}
              defaultPageSize={1000}
              tableHeight="max-h-[calc(100vh-512px)]"
              data={transaction?.recipients || []}
              renderRow={(row) => (
                <RecipientItemRowItem
                  blockExplorer={selectedChain?.blockExplorer}
                  id={uniqueId()}
                  recipient={row}
                  onAddContact={onAddContact}
                  onClickFile={handleOnClickFile}
                  onDownloadFile={handleOnDownloadFile}
                />
              )}
              noData={
                <div className="p-8 flex justify-center">
                  <EmptyData loading={false}>
                    <EmptyData.Icon />
                    <EmptyData.Title>No recipients founds</EmptyData.Title>
                  </EmptyData>
                </div>
              }
            />
          )}
        </section>
        {!transaction?.isRejected && (
          <>
            <Divider />
            <section id="remarks" className="flex flex-row justify-between pb-6">
              <Typography variant="body2">Remarks</Typography>
              <Typography variant="body2">{transaction?.notes ?? '-'}</Typography>
            </section>
          </>
        )}
      </section>
      <section id="cta-buttons" className="flex pb-6 h-[100%]">
        <TransactionActionButtons
          id="detail-tab"
          transaction={transaction}
          isParsingTransactionOwnership={isParsingTransactionOwnership}
          onClickRejectTransaction={onClickRejectTransaction}
          onClickApproveTransaction={onClickApproveTransaction}
          onClickExecuteRejection={onClickExecuteRejection}
          onClickExecuteTransaction={onClickExecuteTransaction}
        />
      </section>
    </div>
  )
}

export default DetailTab
