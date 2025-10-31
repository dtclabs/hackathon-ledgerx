import { FC, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import Image from 'next/legacy/image'
import SelectDropdown from '@/components-v2/Select/Select'
import CryptocurrencyPrice from './CryptocurrencyPrice'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import FormatCoAOptionLabel from '@/views/Transactions-v2/TxGridTable/FormatCoAOptionLabel'
import { resolvedMappingCustomStyles } from '@/views/ChartOfAccounts/List/components/IntegrationSyncModal/FormatResolveMappingOptionLabel'
import { useAppSelector } from '@/state'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import AssetChainGroupImage from '@/components-v2/molecules/AssetChainGroupImage'
import ReactTooltip from 'react-tooltip'
import { toShort } from '@/utils/toShort'
import { useLazyGetFinancialTransactionDefaultMappingQuery } from '@/api-v2/financial-tx-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { getDefaultMappingOptions } from '@/views/Transactions-v2/TxGridTable/txGrid.utils'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'

interface IProps {
  locale: {
    country: any
    timezone: any
    fiatCurrency: any
  }
  onChangeCategory: any
  transaction: any
  accounts: any
  importedChartOfAccounts: any[]
}

const TransactionRows: FC<IProps> = ({ transaction, locale, accounts, onChangeCategory, importedChartOfAccounts }) => {
  const chainIcons = useAppSelector(selectChainIcons)
  const organizationId = useOrganizationId()
  const [getDefaultMapping, { data: defaultMapping, isFetching }] = useLazyGetFinancialTransactionDefaultMappingQuery()

  const chartOfAccountsOptions = useMemo(
    () => getDefaultMappingOptions(accounts, defaultMapping),
    [defaultMapping, accounts]
  )

  const formattedTimeString = formatTimeBasedonUTCOffset(
    transaction.valueTimestamp,
    locale?.timezone?.utcOffset || 480,
    locale?.country?.iso || 'SG',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }
  ).replace(/,([^,]*)$/, '$1')

  const handleChangeCategory = (_data) => {
    onChangeCategory(_data, transaction)
  }

  const contact = useMemo(() => {
    let fromContact = ''
    let toContact = ''

    if (transaction?.fromContact?.name) {
      fromContact = transaction.fromContact.name
    } else {
      fromContact = transaction?.fromAddress ? toShort(transaction?.fromAddress, 5, 4) : '-'
    }

    if (transaction?.toContact?.name) {
      toContact = transaction.toContact.name
    } else {
      toContact = transaction?.toAddress ? toShort(transaction?.toAddress, 5, 4) : '-'
    }
    return {
      fromContact,
      toContact
    }
  }, [transaction])

  return (
    <div
      className="flex flex-row items-center justify-between h-[80px] sm:flex-col sm:gap-0 sm:items-start sm:justify-start sm:w-full sm:py-2"
      style={{ borderBottom: '1px solid #F1F1EF' }}
    >
      <div className="sm:w-full sm:flex sm:gap-2 w-full flex justify-between">
        <div className="flex flex-row gap-2 basis-2/3">
          <div className="flex justify-center items-center">
            <AssetChainGroupImage
              // assetImageUrl={transaction?.cryptocurrency?.image?.small}
              assetImageUrl="/svg/sample-token/Solana.svg"
              chainImageUrl={chainIcons[transaction?.blockchainId]}
            />
          </div>
          <div className="flex w-full">
            <div className="w-1/2 sm:w-full">
              <Typography
                data-tip={`dashboard-txn-${transaction?.id}`}
                data-for={`dashboard-txn-${transaction?.id}`}
                variant="body2"
                classNames="w-fit"
              >
                {transaction?.typeDetail?.label}
              </Typography>
              <Typography classNames="mt-[2px]" variant="caption" color="secondary">
                {formattedTimeString}
              </Typography>
            </div>

            {/* <ReactTooltip
            id={`dashboard-txn-${transaction?.id}`}
            borderColor="#eaeaec"
            border
            backgroundColor="white"
            textColor="#111111"
            effect="solid"
            place="top"
            className="!opacity-100 !rounded-lg max-w-[260px] truncate"
          >
            <Typography color="primary" variant="body2" styleVariant="regular" classNames="truncate">
              <b>From: </b>
              {contact.fromContact}
            </Typography>
            <Typography color="primary" variant="body2" styleVariant="regular" classNames="truncate">
              <b>To: </b>
              {contact.toContact}
            </Typography>
          </ReactTooltip> */}

            <div className="w-1/2 sm:hidden">
              <Typography color="primary" variant="body2" styleVariant="regular" classNames="truncate flex gap-1">
                <div className="text-[#999999]">From: </div>
                {/* {contact.fromContact} */}
                <WalletAddress split={5} address={contact.fromContact}>
                  <WalletAddress.Link address={contact.fromContact} options={[]} />
                  <WalletAddress.Copy address={contact.fromContact} />
                </WalletAddress>
              </Typography>
              <Typography color="primary" variant="body2" styleVariant="regular" classNames="truncate flex gap-1">
                <div className="text-[#999999]">To: </div>
                <b> {contact.toContact}</b>
              </Typography>
            </div>
          </div>
        </div>
        <div className="basis-1/3 flex justify-end text-right sm:basis-1/2">
          <div>
            <CryptocurrencyPrice
              decimal={18}
              fiatCurrency={transaction?.fiatCurrency}
              iso={locale?.country?.iso}
              symbol={transaction?.cryptocurrency?.symbol}
              cryptocurrencyAmount={transaction?.cryptocurrencyAmount}
              fiatAmount={transaction?.fiatAmount}
              currencySymbol={locale?.fiatCurrency?.symbol}
              direction={transaction?.direction}
              id={transaction?.id}
            />
            {/* <Typography>
            {transactionSign} {transaction?.cryptocurrencyAmount}
          </Typography> */}
          </div>
        </div>
        {/* <div className="basis-1/3 flex justify-end">
        <SelectDropdown
          disableIndicator
          isSearchable
          // disabled={!transaction?.isCorrespondingChartOfAccountChangeable}
          styles={resolvedMappingCustomStyles}
          formatOptionLabel={FormatCoAOptionLabel}
          className="w-[170px] 3xl:w-[150px]"
          onChange={handleChangeCategory}
          name="cateogry"
          menuIsOpen={isFetching ? false : undefined}
          onClick={() => {
            getDefaultMapping({ id: transaction.id, orgId: organizationId })
          }}
          defaultValue={
            importedChartOfAccounts?.find(
              (account) => account.value === transaction.correspondingChartOfAccount?.id
            ) || { value: '', label: 'Select account' }
          }
          options={chartOfAccountsOptions}
          value={
            importedChartOfAccounts?.find(
              (account) => account.value === transaction.correspondingChartOfAccount?.id
            ) || { value: '', label: 'Select account' }
          }
        />
      </div> */}
      </div>
      <div className="w-full hidden sm:flex sm:gap-2 sm:pl-8">
        <Typography color="primary" variant="body2" styleVariant="regular" classNames="truncate flex gap-1">
          <div className="text-[#999999] text-xs">From: </div>
          <span className="text-sm">{contact.fromContact}</span>
        </Typography>
        <Typography color="primary" variant="body2" styleVariant="regular" classNames="truncate flex gap-1">
          <div className="text-[#999999] text-xs">To: </div>
          <b className="text-sm"> {contact.toContact}</b>
        </Typography>
      </div>
    </div>
  )
}

export default TransactionRows
