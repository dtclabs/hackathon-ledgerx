/* eslint-disable react/no-array-index-key */
import WalletAddressV2 from '@/components/WalletAddress-v2/WalletAddress'
import { ITransactionRecipient } from '@/slice/old-tx/interface'
import { orgSettingsSelector } from '@/slice/orgSettings/orgSettings-slice'
import { useAppSelector } from '@/state'
import { currencyToWord, toNearestDecimal } from '@/utils-v2/numToWord'
import TokenImage from '../TokenImage/TokenImage'
import Typography from '@/components-v2/atoms/Typography'
import { selectChainIcons } from '@/slice/chains/chain-selectors'
import Image from 'next/legacy/image'
import ReactTooltip from 'react-tooltip'
import { isExistedRecipient, isExistedSource } from '@/utils/isExistedRecipient'
import Avvvatars from 'avvvatars-react'
import WalletAddress from '@/components-v2/molecules/WalletAddressCopy/WalletAddress'
import messageWithDots from '@/public/svg/message-dots-square.svg'
import paperClip from '@/public/svg/paperclip.svg'
import Button from '@/components-v2/atoms/Button'
import { formatTimeBasedonUTCOffset } from '@/utils-v2/formatTime'
import { IFileObject } from '@/hooks-v2/useFileDownload'
import { useGetContactsQuery } from '@/slice/contacts/contacts-api'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { walletsSelector } from '@/slice/wallets/wallet-selectors'

interface CryptoAmountItem {
  image: string
  amount: string
  symbol: string
}

export interface ISafeTransactionOverview {
  recipients: ITransactionRecipient[]
  decimal?: number
  isRejectTransaction?: boolean
  payingFrom: string
  chainId: string
  numericChainId: number
  totalCryptoAssets: CryptoAmountItem[]
  totalFiatAmount: string | number
  safeTxnHash: string
  submitTime: string
  handleBulkDownload: (files: IFileObject[]) => void
  remark: string
  showWarningBannerOnOverview: boolean
  isRejectedTransaction: boolean
}

const SafeTransactionOverview: React.FC<ISafeTransactionOverview> = ({
  recipients,
  payingFrom,
  chainId,
  numericChainId,
  totalCryptoAssets,
  totalFiatAmount,
  safeTxnHash,
  submitTime,
  handleBulkDownload,
  remark,
  showWarningBannerOnOverview,
  isRejectedTransaction
}) => {
  const organizationId = useOrganizationId()
  const { data } = useGetContactsQuery(
    {
      orgId: organizationId,
      params: {
        size: 9999
      }
    },
    { skip: !organizationId }
  )

  const {
    timezone: timeZoneSetting,
    country: countrySetting,
    fiatCurrency: fiatCurrencySetting
  } = useAppSelector(orgSettingsSelector)
  const chainIcons = useAppSelector(selectChainIcons)
  const recipientList = data?.items
  const sourceList = useAppSelector(walletsSelector)

  return (
    <>
      {showWarningBannerOnOverview && (
        <div className="text-center text-warning-600 text-sm bg-warning-50 py-[10px] mb-2 rounded">
          You will still need to execute this transaction to prevent it from holding up your transaction queue.
        </div>
      )}
      <div className="rounded-lg border border-dashboard-border-200 font-inter flex flex-col p-4 items-center mb-4">
        <div className="flex justify-between w-full">
          <Typography variant="body2" styleVariant="semibold" classNames="!text-[#777675]">
            Safe Transaction Hash
          </Typography>
          <div className="flex">
            <WalletAddressV2
              address={safeTxnHash}
              addressClassName="w-fit"
              addressWidth="w-fit"
              noScan
              noCopy
              noAvatar
              noColor
              showFirst={5}
              textAlign="right"
              showLast={4}
              scanType="txHash"
              className="font-inter text-[14px] font-semibold"
            />
            <WalletAddress.Copy address={safeTxnHash} />
          </div>
        </div>
        <div className="flex justify-between w-full mt-3">
          <Typography variant="body2" styleVariant="semibold" classNames="!text-[#777675]">
            Date of Submitting Transfer
          </Typography>
          <Typography variant="body2" styleVariant="semibold">
            {(submitTime &&
              formatTimeBasedonUTCOffset(submitTime, timeZoneSetting?.utcOffset || 480, countrySetting?.iso || 'SG')) ||
              ''}
          </Typography>
        </div>
      </div>
      <div className="rounded-lg border border-dashboard-border-200 font-inter flex p-4 justify-between items-center">
        <Typography variant="body2" styleVariant="semibold" classNames="!text-[#777675]">
          Paying From
        </Typography>
        <div className="flex justify-start gap-3 items-center">
          <div>
            <WalletAddressV2
              // maxWidth="max-w-[290px]"
              addressClassName="w-fit"
              addressWidth=""
              address={payingFrom}
              noColor
              noCopy
              noScan
              noAvatar
              showFirst={5}
              showLast={4}
              className="font-bold"
            />
          </div>
          <div>
            <WalletAddressV2
              // maxWidth="max-w-[290px]"
              addressClassName="w-fit"
              addressWidth="w-fit"
              address={payingFrom}
              noColor
              noCopy
              noScan
              noAvatar
              showFirst={5}
              showLast={4}
              className="text-base leading-6 text-dashboard-main text-[#777675] text-[14px]"
              useAddress
            />
          </div>
          <div>
            <Image src={chainIcons[chainId]} width={14} height={14} className="rounded" />
          </div>
        </div>
      </div>
      {isRejectedTransaction && (
        <div className="rounded-lg border border-dashboard-border-200 font-inter flex flex-col p-4 justify-start items-center mt-2">
          <Typography variant="body2" classNames="!text-[#777675]">
            Transaction has been rejected. No recipient data available
          </Typography>
        </div>
      )}
      {!isRejectedTransaction && (
        <div className="rounded-lg border border-dashboard-border-200 font-inter flex flex-col p-4 justify-start items-center mt-2">
          <div className="flex justify-between w-full border-b border-[#F1F1EF] pb-4">
            <Typography variant="body2" styleVariant="semibold" classNames="!text-[#777675]">
              Paying To
            </Typography>
            <div className="flex">
              <Typography
                variant="body2"
                styleVariant="semibold"
                classNames="!text-[#777675] border-r border-[#F1F1EF] pr-2"
              >
                {`${recipients.length} ${recipients?.length > 1 ? 'Recipients' : 'Recipient'}`}
              </Typography>
              <div
                className="flex gap-2 border-r border-[#F1F1EF] pr-2 mx-2"
                data-tip="asset-grid"
                data-for="asset-grid"
              >
                {totalCryptoAssets?.slice(0, 3)?.map((amountObj) => (
                  <div className="flex gap-1">
                    <Image src={amountObj.image} width={16} height={16} className="flex-shrink-0" />
                    <Typography variant="body2" styleVariant="semibold">
                      {amountObj.amount}
                    </Typography>
                  </div>
                ))}
                {totalCryptoAssets?.length > 3 && (
                  <Typography variant="body2" styleVariant="semibold">
                    ...
                  </Typography>
                )}
              </div>
              <ReactTooltip
                id="asset-grid"
                borderColor="#eaeaec"
                border
                backgroundColor="white"
                textColor="#111111"
                effect="solid"
                className="!opacity-100 !rounded-lg"
              >
                <div className="flex flex-wrap gap-2 max-w-[200px]" data-tip="asset-grid" data-for="asset-grid">
                  {totalCryptoAssets?.map((amountObj) => (
                    <div className="flex gap-1">
                      <Image src={amountObj.image} width={16} height={16} />
                      <Typography variant="body2" styleVariant="semibold">
                        {amountObj.amount}
                      </Typography>
                    </div>
                  ))}
                </div>
              </ReactTooltip>
              <Typography variant="body2" styleVariant="semibold">
                {(totalFiatAmount &&
                  `~ ${fiatCurrencySetting?.symbol}${currencyToWord(
                    `${totalFiatAmount}`,
                    null,
                    countrySetting?.iso,
                    3
                  )} ${recipients[0]?.fiatCurrency?.toUpperCase()}`) ||
                  'Unable to fetch price'}
              </Typography>
            </div>
          </div>
          <div className="flex flex-col w-full">
            {recipients?.map((item, indexRecipient) => (
              <div
                key={`recipient-${indexRecipient}`}
                className={`flex ${
                  recipients.length - indexRecipient > 1 ? 'border-b border-[#F1F1EF]' : ''
                } grid grid-cols-[50px_repeat(5,1fr)] place-content-between justify-items-center items-center mt-4`}
              >
                <div className="pr-4">
                  <Avvvatars style="shape" value={item.address} />
                </div>
                {isExistedRecipient(item.address, recipientList, numericChainId) ||
                isExistedSource(item.address, sourceList) ? (
                  <div className="flex flex-col">
                    <WalletAddressV2
                      maxWidth="max-w-[290px]"
                      address={item.address}
                      noColor
                      noCopy
                      noScan
                      noAvatar
                      chainId={numericChainId}
                      showFirst={5}
                      showLast={4}
                      className="text-base leading-6 text-dashboard-main"
                    />
                    <WalletAddress split={5} address={item.address} color="dark" />
                  </div>
                ) : (
                  <div className="flex flex-col justify-self-start">
                    <WalletAddressV2
                      maxWidth="max-w-[290px]"
                      addressClassName="w-fit"
                      addressWidth="w-fit"
                      address={item.address}
                      noColor
                      noCopy
                      noScan
                      noAvatar
                      chainId={numericChainId}
                      showFirst={5}
                      showLast={4}
                      className="text-base leading-6 text-dashboard-main"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-self-start">
                  <div className="flex items-center gap-2">
                    <TokenImage
                      type="tokenURL"
                      className="w-4 h-4"
                      symbol={item.cryptocurrency.symbol}
                      imageSrc={recipients && item.cryptocurrency?.image.thumb}
                    />
                    <Typography variant="body1">
                      {toNearestDecimal(item.cryptocurrencyAmount, countrySetting?.iso, 5)} {item.cryptocurrency.symbol}
                    </Typography>
                  </div>
                  <div className="text-sm text-grey-700 font-normal font-inter mt-1">
                    {(item &&
                      item.fiatAmount &&
                      `~ ${fiatCurrencySetting?.symbol}${currencyToWord(
                        item.fiatAmount,
                        null,
                        countrySetting?.iso,
                        3
                      )} ${item.fiatCurrency?.toUpperCase()}`) ||
                      'Unsupported'}
                    {/* TODO-PENDING: Add numtoword or the currrencytoword in a similar fashion as txgrid */}
                  </div>
                </div>
                <div className="max-w-[160px]">
                  {item?.chartOfAccount?.id ? (
                    <div>
                      <Typography
                        variant="body2"
                        classNames="text-ellipsis whitespace-nowrap overflow-hidden"
                        data-tip={`coa-${indexRecipient}`}
                        data-for={`coa-${indexRecipient}`}
                      >
                        <span className="text-[#777675]">Account:</span>
                        <span>
                          {item.chartOfAccount.code
                            ? `${item.chartOfAccount.code} - ${item.chartOfAccount.name}`
                            : `${item.chartOfAccount.name}`}
                        </span>
                      </Typography>
                      <ReactTooltip
                        id={`coa-${indexRecipient}`}
                        borderColor="#eaeaec"
                        border
                        backgroundColor="white"
                        textColor="#111111"
                        effect="solid"
                        className="!opacity-100 !rounded-lg"
                      >
                        {item.chartOfAccount.code
                          ? `${item.chartOfAccount.code} - ${item.chartOfAccount.name}`
                          : `${item.chartOfAccount.name}`}
                      </ReactTooltip>
                    </div>
                  ) : (
                    <Typography variant="body2" classNames="!text-[#CECECC]">
                      No Account Selected
                    </Typography>
                  )}
                </div>
                <div className="flex gap-2 items-center ml-2">
                  {item?.notes ? (
                    <>
                      <Image
                        src={messageWithDots}
                        width={16}
                        height={16}
                        alt="message-icon"
                        className="flex-shrink-0 w-8 h-8"
                      />
                      <div className="max-w-[120px]">
                        <Typography
                          variant="body2"
                          classNames="text-ellipsis whitespace-nowrap overflow-hidden"
                          data-tip={`notes-${indexRecipient}`}
                          data-for={`notes-${indexRecipient}`}
                        >
                          {item.notes}
                        </Typography>
                        <ReactTooltip
                          id={`notes-${indexRecipient}`}
                          borderColor="#eaeaec"
                          border
                          backgroundColor="white"
                          textColor="#111111"
                          effect="solid"
                          className="!opacity-100 !rounded-lg"
                        >
                          {item.notes}
                        </ReactTooltip>
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <Image
                        src={messageWithDots}
                        width={16}
                        height={16}
                        alt="message-icon"
                        className="flex-shrink-0 w-8 h-8"
                      />
                      <Typography variant="body2" classNames="!text-[#CECECC]">
                        No Notes
                      </Typography>
                    </div>
                  )}
                </div>
                <div className="justify-self-end flex items-center justify-center w-full">
                  {item?.files?.length > 0 ? (
                    <Button
                      variant="grey"
                      height={32}
                      label={`${item.files.length} ${item.files.length > 1 ? 'Files' : 'File'}`}
                      leadingIcon={<Image src={paperClip} height={14} width={14} />}
                      onClick={() => handleBulkDownload(item.files)}
                    />
                  ) : (
                    <Typography variant="body2" classNames="!text-[#CECECC]">
                      No Files
                    </Typography>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {remark && !isRejectedTransaction && (
        <div className="rounded-lg border border-dashboard-border-200 font-inter flex p-4 justify-between items-center mt-2 gap-4">
          <Typography variant="body2" styleVariant="semibold" classNames="!text-[#777675]">
            Remarks
          </Typography>
          <div className="whitespace-nowrap overflow-hidden">
            <Typography
              variant="body2"
              classNames="text-ellipsis whitespace-nowrap overflow-hidden"
              data-for="remark-tooltip"
              data-tip="remark-tooltip"
            >
              {remark}
            </Typography>
            <ReactTooltip
              id="remark-tooltip"
              borderColor="#eaeaec"
              border
              backgroundColor="white"
              textColor="#111111"
              effect="solid"
              className="!opacity-100 !rounded-lg max-w-[900px] flex whitespace-pre-wrap flex-wrap"
            >
              {remark}
            </ReactTooltip>
          </div>
        </div>
      )}
    </>
  )
}
export default SafeTransactionOverview

// Safe Tx Hash:
// 0x9fa...e0c6
